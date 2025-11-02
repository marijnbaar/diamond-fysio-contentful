import 'dotenv/config';
import { createClient } from 'contentful-management';
import { cfRequest } from '../lib/contentful.js';

type ForceMode = 'none' | 'same' | 'all';

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v = ''] = a.replace(/^--/, '').split('=');
      return [k, v];
    })
  ) as Record<string, string>;
  const pageType = (args.pageType || args.page || '').trim(); // e.g. Aboutpage
  const slug = (args.slug || '').trim(); // e.g. /about
  const forceRaw = (args.forceOverwrite || args.force || 'none').trim();
  const force: ForceMode = forceRaw === 'all' ? 'all' : forceRaw === 'same' ? 'same' : 'none';
  const forcePublish = 'forcePublish' in args || 'publishOnly' in args;
  const repair = 'repair' in args || 'fix' in args; // move target text back to master if master empty
  if (!pageType) throw new Error('Missing --pageType=Aboutpage');
  if (!slug) throw new Error('Missing --slug=/about');
  return { pageType, slug, force, forcePublish, repair };
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

  // Optional repair step: if master is empty but a target (typically en-US) has text, copy to master
  if (repair) {
    for (const fid of fieldsToProcess) {
      const f = entry.fields?.[fid];
      if (!f) continue;
      const masterVal = f[MASTER_LOCALE];
      const enVal = f[targetEn];
      const hasMaster = masterVal != null && masterVal !== '';
      const hasEn = enVal != null && enVal !== '';
      if (!hasMaster && hasEn) {
        f[MASTER_LOCALE] = enVal; // backfill master from EN (likely Dutch erroneously stored in EN)
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
      let newVal: any = typeof src === 'string' ? translated[0] : JSON.parse(JSON.stringify(src));
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
    } catch {}
  }
  return { updated: true, published } as const;
}

function buildPageQuery(pageType: string) {
  return `
    query PageWithComponents($locale: String) {
      ${pageType.toLowerCase()}Collection(limit: 10, locale: $locale) {
        items {
          sys { id }
          slug
          components: componentsCollection(locale: $locale) {
            items { __typename sys { id } }
          }
        }
      }
    }
  `;
}

async function main() {
  const { pageType, slug, force, forcePublish } = parseArgs();
  const query = buildPageQuery(pageType);
  // Fetch default-locale to resolve entry by slug
  const pageData = await cfRequest<any>(query, {});
  const items = pageData?.[`${pageType.toLowerCase()}Collection`]?.items || [];
  const page = items.find((it: any) => it.slug === slug);
  if (!page) throw new Error(`Page not found for slug ${slug} in ${pageType}`);

  // Collect present components by typename
  const present = (page.components?.items || []).map((it: any) => ({
    id: it?.sys?.id,
    type: it?.__typename
  }));
  const env = await (await cmClient.getSpace(SPACE_ID)).getEnvironment(ENV_ID);

  const stats = { seen: 0, updated: 0, published: 0 };
  const textTypes = new Set(['Text', 'Symbol', 'RichText']);

  for (const { id, type } of present) {
    if (!id || !type) continue;
    // Management API expects content type ID (lowerCamelCase), GraphQL __typename is PascalCase
    const contentTypeId = type.charAt(0).toLowerCase() + type.slice(1);
    // Discover localized text fields on this component type
    const ct = await env.getContentType(contentTypeId).catch(() => null);
    if (!ct) continue;
    const fieldIds = ct.fields
      .filter((f: any) => f.localized === true && textTypes.has(f.type))
      .map((f: any) => f.id);
    if (fieldIds.length === 0) continue;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[page-import] processing', { id, type, contentTypeId, fields: fieldIds });
    }
    stats.seen++;
    const res = await updateEntry(env, id, fieldIds, force, forcePublish, repair);
    if (res.updated) stats.updated++;
    if (res.published) stats.published++;
  }

  console.log('Page components import finished:', { pageType, slug, stats, present });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
