import 'dotenv/config';
import { createClient } from 'contentful-management';

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v = ''] = a.replace(/^--/, '').split('=');
      return [k, v];
    })
  ) as Record<string, string>;
  const code = args.code || 'nl-NL';
  return { code };
}

const SPACE_ID = (process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID)!;
const ENV_ID = (process.env.CTF_ENV_ID || process.env.ENV_ID || 'master')!;
const MGMT_TOKEN = (process.env.CTF_MANAGEMENT_TOKEN || process.env.CMAACCESSTOKEN)!;

const client = createClient({ accessToken: MGMT_TOKEN });

async function main() {
  const { code } = parseArgs();
  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENV_ID);

  const locales = await env.getLocales();
  const target = locales.items.find((l: any) => l.code === code);
  if (!target) throw new Error(`Locale not found: ${code}`);

  if (target.default) {
    console.log(`Locale ${code} is already default.`);
    return;
  }

  target.default = true;
  const updated = await target.update();
  console.log('Default locale set to:', updated.code);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
