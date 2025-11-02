import 'dotenv/config';
import { createClient } from 'contentful-management';

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v = ''] = a.replace(/^--/, '').split('=');
      return [k, v];
    })
  ) as Record<string, string>;
  const code = args.code || 'en-US';
  const name = args.name || 'English (United States)';
  const fallback = args.fallback || process.env.MASTER_LOCALE || 'nl-NL';
  return { code, name, fallback };
}

const SPACE_ID = (process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID)!;
const ENV_ID = (process.env.CTF_ENV_ID || process.env.ENV_ID || 'master')!;
const MGMT_TOKEN = (process.env.CTF_MANAGEMENT_TOKEN || process.env.CMAACCESSTOKEN)!;

const client = createClient({ accessToken: MGMT_TOKEN });

async function main() {
  const { code, name, fallback } = parseArgs();
  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENV_ID);

  const existing = await env.getLocales();
  const found = existing.items.find((l: any) => l.code === code);
  if (found) {
    console.log(`Locale already exists: ${code}`);
    return;
  }

  const created = await env.createLocale({
    code,
    name,
    fallbackCode: fallback,
    optional: true
  } as any);

  console.log('Created locale:', created.code, 'fallback:', created.fallbackCode);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
