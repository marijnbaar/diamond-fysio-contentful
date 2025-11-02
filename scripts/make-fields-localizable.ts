import 'dotenv/config';
import { createClient } from 'contentful-management';

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v = ''] = a.replace(/^--/, '').split('=');
      return [k, v];
    })
  ) as Record<string, string>;
  const allTypes = 'allTypes' in args || 'all' in args;
  const auto = 'auto' in args; // pick all text/rich text fields automatically
  const contentType = args.contentType || '';
  const fields = (args.fields || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return { contentType, fields, allTypes, auto };
}

const SPACE_ID = (process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID)!;
const ENV_ID = (process.env.CTF_ENV_ID || process.env.ENV_ID || 'master')!;
const MGMT_TOKEN = (process.env.CTF_MANAGEMENT_TOKEN || process.env.CMAACCESSTOKEN)!;

const client = createClient({ accessToken: MGMT_TOKEN });

async function main() {
  const { contentType, fields, allTypes, auto } = parseArgs();
  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENV_ID);

  const textTypes = new Set(['Text', 'Symbol', 'RichText']);

  if (allTypes) {
    const types = await env.getContentTypes();
    let changed = 0;
    for (const ct of types.items) {
      let mutated = false;
      for (const f of ct.fields) {
        if (!textTypes.has(f.type)) continue;
        if (f.localized !== true) {
          f.localized = true;
          mutated = true;
        }
      }
      if (mutated) {
        const upd = await (await env.getContentType(ct.sys.id)).update();
        await upd.publish();
        changed++;
        console.log('Updated & published content type:', ct.sys.id);
      }
    }
    console.log('Done. Content types changed:', changed);
    return;
  }

  if (!contentType) throw new Error('Missing --contentType=ID (or use --allTypes)');

  const ct = await env.getContentType(contentType);
  let mutated = false;
  if (auto) {
    for (const f of ct.fields) {
      if (!textTypes.has(f.type)) continue;
      if (f.localized !== true) {
        f.localized = true;
        mutated = true;
      }
    }
  } else {
    if (fields.length === 0) throw new Error('Missing --fields=fieldA,fieldB (or use --auto)');
    for (const fId of fields) {
      const f = ct.fields.find((x: any) => x.id === fId);
      if (!f) {
        console.warn(`Field not found on ${contentType}: ${fId}`);
        continue;
      }
      if (f.localized !== true) {
        f.localized = true;
        mutated = true;
      }
    }
  }

  if (!mutated) {
    console.log('No changes needed.');
    return;
  }

  const updated = await ct.update();
  const published = await updated.publish();
  console.log('Content type updated & published:', published.sys?.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
