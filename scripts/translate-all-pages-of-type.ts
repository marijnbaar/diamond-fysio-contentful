import 'dotenv/config';
import { createClient } from 'contentful-management';
// We will use Management API to list entries by content type to avoid GraphQL

type ForceMode = 'none' | 'same' | 'all';

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v = ''] = a.replace(/^--/, '').split('=');
      return [k, v];
    })
  ) as Record<string, string>;
  const pageType = (args.pageType || args.page || '').trim(); // e.g. Specialisationpage
  const forceRaw = (args.forceOverwrite || args.force || 'none').trim();
  const force: ForceMode = forceRaw === 'all' ? 'all' : forceRaw === 'same' ? 'same' : 'none';
  const forcePublish = 'forcePublish' in args || 'publishOnly' in args;
  const repair = 'repair' in args || 'fix' in args;
  if (!pageType) throw new Error('Missing --pageType=Specialisationpage');
  return { pageType, force, forcePublish, repair };
}

const SPACE_ID = (process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID)!;
const ENV_ID = (process.env.CTF_ENV_ID || process.env.ENV_ID || 'master')!;
const MGMT_TOKEN = (process.env.CTF_MANAGEMENT_TOKEN || process.env.CMAACCESSTOKEN)!;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
const MASTER_LOCALE = process.env.MASTER_LOCALE || 'nl-NL';
const ALLOWED_LOCALES = (process.env.ALLOWED_LOCALES || 'nl-NL,en-US')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const TARGETS = ALLOWED_LOCALES.filter((l) => l !== MASTER_LOCALE);
const PUBLISH = (process.env.PUBLISH_AFTER_UPDATE ?? 'true').toLowerCase() === 'true';

const cmClient = createClient({ accessToken: MGMT_TOKEN });

async function translateBatch(texts: string[], lang: string): Promise<string[]> {
  if (texts.length === 0) return [];
  const res = await fetch(`${SITE_URL}/api/translate/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, lang })
  });
  if (!res.ok) return texts;
  const json = (await res.json()) as { items?: string[] };
  return Array.isArray(json.items)
    ? json.items.map((s, i) => (typeof s === 'string' ? s : texts[i]))
    : texts;
}

function looksLikeNonHuman(s: string) {
  if (!s) return true;
  return /^(https?:\/\/|#[0-9A-Fa-f]{3,6}$)/.test(s) || s.length <= 1;
}

function collectTextPaths(value: any): { path: (string | number)[]; text: string }[] {
  const out: { path: (string | number)[]; text: string }[] = [];
  if (typeof value === 'string') {
    if (!looksLikeNonHuman(value)) out.push({ path: [], text: value });
    return out;
  }
  const doc = value?.json?.nodeType === 'document' ? value.json : value;
  function walk(node: any, path: (string | number)[]) {
    if (!node || typeof node !== 'object') return;
    if (node.nodeType === 'text' && typeof node.value === 'string' && node.value.trim()) {
      if (!looksLikeNonHuman(node.value))
        out.push({ path: path.concat('value'), text: node.value });
      return;
    }
    const content = Array.isArray(node.content) ? node.content : [];
    for (let i = 0; i < content.length; i++) walk(content[i], path.concat('content', i));
  }
  if (doc && doc.nodeType === 'document') walk(doc, []);
  return out;
}

function writeAtPath(root: any, path: (string | number)[], val: string) {
  let cur = root;
  for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
  cur[path[path.length - 1]] = val;
}

async function updateEntry(
  env: any,
  entryId: string,
  fieldsToProcess: string[],
  force: ForceMode,
  forcePublish: boolean,
  repair: boolean
) {
  const entry = await env.getEntry(entryId).catch(() => null);
  if (!entry || entry?.sys?.archivedAt) return { updated: false, published: false } as const;
  let changed = false;
  const targetEn = 'en-US';

  if (repair) {
    for (const fid of fieldsToProcess) {
      const f = entry.fields?.[fid];
      if (!f) continue;
      const masterVal = f[MASTER_LOCALE];
      const enVal = f[targetEn];
      const hasMaster = masterVal != null && masterVal !== '';
      const hasEn = enVal != null && enVal !== '';
      if (!hasMaster && hasEn) {
        f[MASTER_LOCALE] = enVal; // backfill master
        changed = true;
      }
    }
  }

  for (const target of TARGETS) {
    for (const fid of fieldsToProcess) {
      const f = entry.fields?.[fid];
      if (!f) continue;
      const src = f[MASTER_LOCALE];
      if (src == null) continue;
      const hasTarget = f[target] != null && f[target] !== '';
      if (hasTarget && force === 'none') continue;
      if (hasTarget && force === 'same') {
        const s = collectTextPaths(src)
          .map((p) => p.text)
          .join('\n')
          .trim()
          .toLowerCase();
        const t = collectTextPaths(f[target])
          .map((p) => p.text)
          .join('\n')
          .trim()
          .toLowerCase();
        if (s !== t) continue;
      }
      // force === 'all' always overwrites
      const paths = collectTextPaths(src);
      if (paths.length === 0) continue;
      const translated = await translateBatch(
        paths.map((p) => p.text),
        target
      );
      const newVal: any = typeof src === 'string' ? translated[0] : JSON.parse(JSON.stringify(src));
      if (typeof src !== 'string') {
        const base = newVal?.json?.nodeType === 'document' ? newVal.json : newVal;
        for (let i = 0; i < paths.length; i++) writeAtPath(base, paths[i].path, translated[i]);
      }
      entry.fields[fid][target] = newVal;
      changed = true;
    }
  }

  if (!changed) {
    if (forcePublish && PUBLISH) {
      try {
        await entry.publish();
        return { updated: false, published: true } as const;
      } catch {
        return { updated: false, published: false } as const;
      }
    }
    return { updated: false, published: false } as const;
  }

  const updated = await entry.update();
  let published = false;
  if (PUBLISH) {
    try {
      await updated.publish();
      published = true;
    } catch {
      // Ignore publish errors
    }
  }
  return { updated: true, published } as const;
}

async function main() {
  const { pageType, force, forcePublish, repair } = parseArgs();
  const env = await (await cmClient.getSpace(SPACE_ID)).getEnvironment(ENV_ID);
  const textTypes = new Set(['Text', 'Symbol', 'RichText']);
  const global = { seenEntries: 0, updated: 0, published: 0 };

  // Resolve Contentful content type id (lowerCamelCase)
  const contentTypeId = pageType.charAt(0).toLowerCase() + pageType.slice(1);
  const ct = await env.getContentType(contentTypeId).catch(() => null);
  if (!ct) throw new Error(`Content type not found: ${contentTypeId}`);

  // Discover localized text fields for this page type (itself may be a page with text)
  const pageTextFields = ct.fields
    .filter((f: any) => f.localized === true && textTypes.has(f.type))
    .map((f: any) => f.id);

  let skip = 0;
  const limit = 100;
  let total = 0;
  do {
    const res = await env.getEntries({ content_type: contentTypeId, limit, skip, locale: '*' });
    total = res.total || 0;
    for (const entry of res.items) {
      // First: update the page entry itself (if it has localized text fields)
      if (pageTextFields.length > 0) {
        global.seenEntries++;
        const r1 = await updateEntry(
          env,
          entry.sys.id,
          pageTextFields,
          force,
          forcePublish,
          repair
        );
        if (r1.updated) global.updated++;
        if (r1.published) global.published++;
      }
      // Then: update any nested components if present
      const comps =
        entry.fields?.components?.[MASTER_LOCALE]?.items || entry.fields?.components?.items || [];
      for (const it of comps) {
        const compId = it?.sys?.id;
        // Management API items may be links; resolve type via entry fetch
        if (!compId) continue;
        const compEntry = await env.getEntry(compId).catch(() => null);
        if (!compEntry) continue;
        const compTypeId = compEntry.sys.contentType.sys.id;
        const compCt = await env.getContentType(compTypeId).catch(() => null);
        if (!compCt) continue;
        const compFields = compCt.fields
          .filter((f: any) => f.localized === true && textTypes.has(f.type))
          .map((f: any) => f.id);
        if (compFields.length === 0) continue;
        global.seenEntries++;
        const r2 = await updateEntry(env, compId, compFields, force, forcePublish, repair);
        if (r2.updated) global.updated++;
        if (r2.published) global.published++;
      }
    }
    skip += res.items.length;
  } while (skip < total);

  console.log('All entries import finished:', { contentTypeId, global });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
