import 'dotenv/config';
import { createClient } from 'contentful-management';
import fetch from 'node-fetch';
import { ALLOWED_LOCALES, MASTER_LOCALE } from '../lib/contentful.js';

type Args = {
  contentType: string; // e.g. 'aboutpage'
  fields: string[]; // e.g. ['title','subtitle','description']
  allFields?: boolean; // discover fields from content type (text/richText & localized)
  forceMode?: 'same' | 'all' | null; // overwrite behavior
  entryId?: string | null; // process a single entry id if provided
  repair?: boolean; // backfill master from EN when master is empty
};

function parseArgs(): Args {
  // Usage: pnpm run import:i18n:auto -- --contentType=aboutpage --fields=title,subtitle,description
  const arg = Object.fromEntries(
    process.argv.slice(2).map((p) => {
      const [k, v = ''] = p.replace(/^--/, '').split('=');
      return [k, v];
    })
  ) as Record<string, string>;
  const contentType = arg.contentType || arg.content_type || '';
  if (!contentType) throw new Error('Missing --contentType=YOUR_CONTENT_TYPE_ID');
  const fields = (arg.fields || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allFields = 'allFields' in arg;
  const forceRaw = arg.forceOverwrite || arg.force || '';
  let forceMode: 'same' | 'all' | null = null;
  if (forceRaw === 'all') forceMode = 'all';
  else if (forceRaw === 'same' || 'forceOverwrite' in arg || 'force' in arg) forceMode = 'same';
  const entryId = (arg.entryId || arg.entryid || '').trim() || null;
  const repair = 'repair' in arg || 'fix' in arg;
  return { contentType, fields, allFields, forceMode, entryId, repair };
}

const SPACE_ID = (process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID)!;
const ENV_ID = (process.env.CTF_ENV_ID || process.env.ENV_ID || 'master')!;
const MGMT_TOKEN = (process.env.CTF_MANAGEMENT_TOKEN || process.env.CMAACCESSTOKEN)!;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
const PUBLISH = (process.env.PUBLISH_AFTER_UPDATE ?? 'true').toLowerCase() === 'true';

const client = createClient({ accessToken: MGMT_TOKEN });

function looksLikeUrlOrCode(s: string): boolean {
  if (!s) return true;
  if (/^https?:\/\//i.test(s)) return true;
  if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(s)) return true;
  if (/^#[0-9A-Fa-f]{3,6}$/.test(s)) return true;
  if (/^\/?[\w-]+(\/|\.|\?|#).*/.test(s)) return true;
  if (s.length <= 1) return true;
  return false;
}

type TextPath = { path: (string | number)[]; text: string };

interface RichTextNode {
  nodeType?: string;
  value?: string;
  content?: RichTextNode[];
}

function collectRichText(node: unknown, basePath: (string | number)[], out: TextPath[]) {
  if (!node || typeof node !== 'object') return;
  const richNode = node as RichTextNode;
  if (
    richNode.nodeType === 'text' &&
    typeof richNode.value === 'string' &&
    richNode.value.trim() !== ''
  ) {
    if (!looksLikeUrlOrCode(richNode.value))
      out.push({ path: basePath.concat('value'), text: richNode.value });
    return;
  }
  const content = Array.isArray(richNode.content) ? richNode.content : [];
  for (let i = 0; i < content.length; i++) {
    collectRichText(content[i], basePath.concat('content', i), out);
  }
}

function collectFieldTexts(value: unknown): TextPath[] {
  const out: TextPath[] = [];
  if (typeof value === 'string') {
    if (!looksLikeUrlOrCode(value)) out.push({ path: [], text: value });
    return out;
  }
  const maybeDoc = value?.json?.nodeType === 'document' ? value.json : value;
  if (maybeDoc && typeof maybeDoc === 'object' && maybeDoc.nodeType === 'document') {
    collectRichText(maybeDoc, [], out);
  }
  return out;
}

function comparableText(value: unknown): string {
  const arr = collectFieldTexts(value).map((p) => p.text);
  return arr.join('\n').replace(/\s+/g, ' ').trim().toLowerCase();
}

function setAtPath(root: Record<string, unknown>, path: (string | number)[], newValue: string) {
  let cur: unknown = root;
  for (let i = 0; i < path.length - 1; i++) {
    if (typeof cur === 'object' && cur !== null) {
      cur = (cur as Record<string | number, unknown>)[path[i]];
    }
  }
  if (typeof cur === 'object' && cur !== null) {
    (cur as Record<string | number, unknown>)[path[path.length - 1]] = newValue;
  }
}

async function translateBatch(texts: string[], targetLocale: string): Promise<string[]> {
  if (texts.length === 0) return [];
  const res = await fetch(`${SITE_URL}/api/translate/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, lang: targetLocale })
  });
  if (!res.ok) {
    // Fallback: return originals
    return texts;
  }
  const json = (await res.json()) as { items?: string[] };
  if (!Array.isArray(json.items)) return texts;
  return json.items.map((s, i) => (typeof s === 'string' && s.trim() ? s : texts[i]));
}

interface ContentfulEntry {
  sys?: { id?: string; archivedAt?: string };
  fields?: Record<string, Record<string, unknown>>;
  update?: () => Promise<ContentfulEntry>;
  publish?: () => Promise<ContentfulEntry>;
}

interface ContentfulEnvironment {
  getEntry: (id: string) => Promise<ContentfulEntry>;
  getEntries: (params: {
    content_type: string;
    limit: number;
    skip: number;
    locale: string;
  }) => Promise<{ items: ContentfulEntry[]; total?: number }>;
}

async function processEntry(
  env: ContentfulEnvironment,
  entry: ContentfulEntry,
  fields: string[],
  targetLocales: string[],
  forceMode: 'same' | 'all' | null,
  repair: boolean
) {
  // Skip archived entries entirely
  if (entry?.sys?.archivedAt) return { updated: false, published: false } as const;
  let mutated = false;

  // Optional repair: if master locale empty and EN has value, copy EN->master first
  if (repair) {
    const en = 'en-US';
    for (const fieldId of fields) {
      const f = entry.fields?.[fieldId];
      if (!f) continue;
      const masterVal = f[MASTER_LOCALE];
      const enVal = f[en];
      const hasMaster = masterVal != null && masterVal !== '';
      const hasEn = enVal != null && enVal !== '';
      if (!hasMaster && hasEn) {
        entry.fields[fieldId][MASTER_LOCALE] = enVal;
        mutated = true;
      }
    }
  }

  for (const target of targetLocales) {
    for (const fieldId of fields) {
      const f = entry.fields?.[fieldId];
      if (!f) continue;

      const hasTarget = f[target] != null && f[target] !== '';
      if (hasTarget && !forceMode) continue; // no overwrite requested

      const source = f[MASTER_LOCALE];
      if (source == null) continue;

      if (hasTarget && forceMode === 'same') {
        const srcText = comparableText(source);
        const tgtText = comparableText(f[target]);
        if (srcText !== tgtText) continue; // already translated, skip
      }
      // forceMode === 'all' always overwrites

      const paths = collectFieldTexts(source);
      if (paths.length === 0) continue;

      const texts = paths.map((p) => p.text);
      const translated = await translateBatch(texts, target);

      // Clone source as base and write translated values into a copy
      let newValue: string | Record<string, unknown>;
      if (typeof source === 'string') {
        newValue = translated[0];
      } else {
        const cloned = JSON.parse(JSON.stringify(source)) as Record<string, unknown>;
        const baseDoc =
          (cloned?.json as { nodeType?: string } | undefined)?.nodeType === 'document'
            ? (cloned.json as Record<string, unknown>)
            : cloned;
        for (let i = 0; i < paths.length; i++) {
          if (typeof baseDoc === 'object' && baseDoc !== null) {
            setAtPath(baseDoc as Record<string, unknown>, paths[i].path, translated[i]);
          }
        }
        newValue = cloned;
      }

      entry.fields[fieldId][target] = newValue;
      mutated = true;
    }
  }

  if (!mutated) return { updated: false, published: false } as const;
  const updated = await entry.update();
  let published = false;
  if (PUBLISH) {
    try {
      await updated.publish();
      published = true;
    } catch (e) {
      // ignore publish errors but report
      console.warn(`Publish failed for ${entry.sys?.id}: ${(e as Error).message}`);
    }
  }
  return { updated: true, published } as const;
}

async function main() {
  const { contentType, fields, allFields, forceMode, entryId, repair } = parseArgs();
  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENV_ID);

  let fieldsList = fields.slice();
  if (allFields || fieldsList.length === 0) {
    const ct = await env.getContentType(contentType);
    const textTypes = new Set(['Text', 'Symbol', 'RichText']);
    fieldsList = ct.fields
      .filter(
        (f: { localized?: boolean; type?: string }) =>
          f.localized === true && textTypes.has(f.type ?? '')
      )
      .map((f: { id?: string }) => f.id ?? '')
      .filter(Boolean);
    console.log(`[auto] using all localized text fields for ${contentType}:`, fieldsList);
  }

  const targetLocales = ALLOWED_LOCALES.filter((l) => l !== MASTER_LOCALE);

  const stats = { seen: 0, updated: 0, published: 0 };

  if (entryId) {
    const entry = await env.getEntry(entryId).catch(() => null);
    if (!entry) throw new Error(`Entry not found: ${entryId}`);
    stats.seen = 1;
    const out = await processEntry(
      env,
      entry,
      fieldsList,
      targetLocales,
      forceMode ?? null,
      !!repair
    );
    if (out.updated) stats.updated++;
    if (out.published) stats.published++;
  } else {
    let skip = 0;
    const limit = 100;
    let total = 0;
    do {
      const res = await env.getEntries({ content_type: contentType, limit, skip, locale: '*' });
      total = res.total || 0;
      for (const item of res.items) {
        stats.seen++;
        const out = await processEntry(
          env,
          item,
          fieldsList,
          targetLocales,
          forceMode ?? null,
          !!repair
        );
        if (out.updated) stats.updated++;
        if (out.published) stats.published++;
      }
      skip += res.items.length;
    } while (skip < total);
  }

  console.log('Auto-translate import completed:', stats);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
