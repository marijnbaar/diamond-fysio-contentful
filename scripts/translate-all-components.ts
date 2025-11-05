import 'dotenv/config';
import { createClient } from 'contentful-management';

type ForceMode = 'none' | 'same' | 'all';

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v = ''] = a.replace(/^--/, '').split('=');
      return [k, v];
    })
  ) as Record<string, string>;
  const forceRaw = (args.forceOverwrite || args.force || 'none').trim();
  const force: ForceMode = forceRaw === 'all' ? 'all' : forceRaw === 'same' ? 'same' : 'none';
  const forcePublish = 'forcePublish' in args || 'publishOnly' in args;
  const repair = 'repair' in args || 'fix' in args;
  const autoLocalize = 'autoLocalize' in args || 'autolocalize' in args || 'auto' in args;
  const include = (args.include || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean); // lowerCamel ids
  const exclude = (args.exclude || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return { force, forcePublish, repair, include, exclude, autoLocalize };
}

const SPACE_ID = (process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID)!;
const ENV_ID = (process.env.CTF_ENV_ID || process.env.ENV_ID || 'master')!;
const MGMT_TOKEN = (process.env.CTF_MANAGEMENT_TOKEN || process.env.CMAACCESSTOKEN)!;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
const MASTER_LOCALE = process.env.MASTER_LOCALE || 'nl-NL';
// Only translate to English (en-US), ignore other locales even if in ALLOWED_LOCALES
const TARGETS = ['en-US'];
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
  contentType: any,
  force: ForceMode,
  forcePublish: boolean,
  repair: boolean
) {
  const entry = await env.getEntry(entryId).catch(() => null);
  if (!entry || entry?.sys?.archivedAt) return { updated: false, published: false } as const;

  // Build field type map for validation
  const fieldTypeMap = new Map<string, string>();
  if (contentType?.fields) {
    for (const f of contentType.fields) {
      fieldTypeMap.set(f.id, f.type);
    }
  }

  // Helper to truncate Symbol values to 255 chars
  const validateFieldValue = (fieldId: string, value: any, locale: string): any => {
    const fieldType = fieldTypeMap.get(fieldId);
    if (fieldType === 'Symbol' && typeof value === 'string' && value.length > 255) {
      const truncated = value.substring(0, 252) + '...';
      console.warn(
        `[translate-all] Field ${fieldId} (${locale}) exceeded 255 chars (Symbol max), truncated from ${value.length} to 255 chars`
      );
      return truncated;
    }
    return value;
  };

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
        f[MASTER_LOCALE] = validateFieldValue(fid, enVal, MASTER_LOCALE);
        changed = true;
      }
    }
  }
  for (const target of TARGETS) {
    for (const fid of fieldsToProcess) {
      const f = entry.fields?.[fid];
      if (!f) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[translate-all]   Field ${fid} not found in entry ${entryId}`);
        }
        continue;
      }
      const src = f[MASTER_LOCALE];
      if (src == null || src === '') {
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[translate-all]   Field ${fid} has no source value (${MASTER_LOCALE}) in entry ${entryId}`
          );
        }
        continue;
      }
      const hasTarget = f[target] != null && f[target] !== '';
      if (hasTarget && force === 'none') {
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[translate-all]   Field ${fid} already has ${target} value, skipping (force=none)`
          );
        }
        continue;
      }
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
        if (s !== t) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[translate-all]   Field ${fid} ${target} differs from source, skipping (force=same)`
            );
          }
          continue;
        }
      }
      // Check if source value is already too long for Symbol type
      const fieldType = fieldTypeMap.get(fid);
      if (fieldType === 'Symbol' && typeof src === 'string' && src.length > 255) {
        console.warn(
          `[translate-all] Skipping field ${fid}: source value (${src.length} chars) exceeds Symbol max (255). Consider changing field type to Text.`
        );
        continue;
      }

      // force === 'all' always overwrites
      const paths = collectTextPaths(src);
      if (paths.length === 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[translate-all]   Field ${fid} has no extractable text paths`);
        }
        continue;
      }
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[translate-all]   Translating field ${fid} from ${MASTER_LOCALE} to ${target}...`
        );
      }
      const translated = await translateBatch(
        paths.map((p) => p.text),
        target
      );
      let newVal: any = typeof src === 'string' ? translated[0] : JSON.parse(JSON.stringify(src));
      if (typeof src !== 'string') {
        const base = newVal?.json?.nodeType === 'document' ? newVal.json : newVal;
        for (let i = 0; i < paths.length; i++) writeAtPath(base, paths[i].path, translated[i]);
      }
      // Validate Symbol field length before assigning
      newVal = validateFieldValue(fid, newVal, target);
      entry.fields[fid][target] = newVal;
      changed = true;
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[translate-all]   ✓ Set ${fid}[${target}]`);
      }
    }
  }
  if (!changed) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[translate-all]   No changes made to entry ${entryId}`);
    }
    if (forcePublish && PUBLISH) {
      try {
        await entry.publish();
        return { updated: false, published: true } as const;
      } catch {
        // Ignore publish errors
      }
    }
    return { updated: false, published: false } as const;
  }
  try {
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
  } catch (err: any) {
    console.error(`[translate-all] Failed to update entry ${entryId}:`, err.message);
    if (err.details?.errors) {
      console.error(
        '[translate-all] Validation errors:',
        JSON.stringify(err.details.errors, null, 2)
      );
    }
    return { updated: false, published: false } as const;
  }
}

async function main() {
  const { force, forcePublish, repair, include, exclude, autoLocalize } = parseArgs();
  const env = await (await cmClient.getSpace(SPACE_ID)).getEnvironment(ENV_ID);
  const textTypes = new Set(['Text', 'Symbol', 'RichText']);
  const global = { processedTypes: 0, seenEntries: 0, updated: 0, published: 0 };

  const types = await env.getContentTypes();
  const mapType = (t: string) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t);
  const includeIds = include.length ? include.map(mapType) : [];
  const excludeIds = exclude.map(mapType);

  // Create a case-insensitive lookup map: lowercase -> actual ID
  const idLookup = new Map<string, string>();
  for (const ct of types.items) {
    const lowerId = ct.sys.id.toLowerCase();
    idLookup.set(lowerId, ct.sys.id);
    // Also add the mapped version (first char lowercase)
    const mappedId = mapType(ct.sys.id);
    if (mappedId !== ct.sys.id) {
      idLookup.set(mappedId.toLowerCase(), ct.sys.id);
    }
  }

  // Normalize include/exclude to actual IDs (case-insensitive)
  const normalizedIncludeIds = includeIds.length
    ? includeIds.map((id) => idLookup.get(id.toLowerCase()) || id).filter(Boolean)
    : [];
  const normalizedExcludeIds = excludeIds.length
    ? excludeIds.map((id) => idLookup.get(id.toLowerCase()) || id).filter(Boolean)
    : [];

  // Debug: list all available content type IDs
  if (include.length) {
    const allIds = types.items.map((ct: any) => ct.sys.id);
    console.log('[translate-all] All available content type IDs:', allIds);
    console.log('[translate-all] Looking for (normalized):', normalizedIncludeIds);
    console.log(
      '[translate-all] Matched IDs:',
      allIds.filter((id: string) => normalizedIncludeIds.includes(id))
    );
  }

  for (const ct of types.items) {
    const id: string = ct.sys.id; // Can be PascalCase or lowerCamelCase
    if (normalizedIncludeIds.length && !normalizedIncludeIds.includes(id)) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[translate-all] Skipping ${id} (not in include list)`);
      }
      continue;
    }
    if (normalizedExcludeIds.length && normalizedExcludeIds.includes(id)) {
      console.log(`[translate-all] Skipping ${id} (in exclude list)`);
      continue;
    }

    // Determine if this type has any localized text fields
    let fieldIds = ct.fields
      .filter((f: any) => f.localized === true && textTypes.has(f.type))
      .map((f: any) => f.id);

    const allTextFields = ct.fields.filter((f: any) => textTypes.has(f.type));
    const nonLocalizedTextFields = allTextFields.filter((f: any) => f.localized !== true);

    console.log(`[translate-all] Processing ${id}:`, {
      hasLocalizedTextFields: fieldIds.length > 0,
      localizedFields: fieldIds,
      allTextFields: allTextFields.map((f: any) => ({
        id: f.id,
        type: f.type,
        localized: f.localized
      })),
      nonLocalizedTextFields: nonLocalizedTextFields.length,
      autoLocalize
    });

    // If no localized text fields but there are text fields, optionally localize them automatically
    if (fieldIds.length === 0 && autoLocalize && nonLocalizedTextFields.length > 0) {
      console.log(
        `[translate-all] Auto-localizing ${nonLocalizedTextFields.length} text fields for ${id}`
      );
      try {
        const ctToUpdate = await env.getContentType(id);
        // Modify fields directly on the content type object (not after update())
        let mutated = false;
        for (const f of ctToUpdate.fields) {
          if (textTypes.has(f.type) && f.localized !== true) {
            f.localized = true;
            mutated = true;
            console.log(`[translate-all]   - Setting ${f.id} (${f.type}) to localized`);
          }
        }
        if (mutated) {
          const upd = await ctToUpdate.update();
          await upd.publish();
          console.log(`[translate-all]   ✓ Published ${id}`);
          // Wait a bit for Contentful to propagate changes
          await new Promise((resolve) => setTimeout(resolve, 500));
          // Reload content type from fresh query
          const reloaded = await env.getContentType(id);
          fieldIds = reloaded.fields
            .filter((f: any) => f.localized === true && textTypes.has(f.type))
            .map((f: any) => f.id);
          console.log(
            `[translate-all] After auto-localize, ${id} has ${fieldIds.length} localized fields:`,
            fieldIds
          );
        } else {
          console.log(`[translate-all]   No fields needed localization for ${id}`);
        }
      } catch (err: any) {
        console.error(`[translate-all] Failed to auto-localize ${id}:`, err.message);
        if (err.stack) console.error(err.stack);
      }
    }

    if (fieldIds.length === 0) {
      console.log(`[translate-all] Skipping ${id} (no localized text fields found)`);
      continue;
    }

    // Get fresh content type for field validation (after potential auto-localize)
    const contentTypeForValidation = await env.getContentType(id);

    global.processedTypes++;
    let skip = 0;
    const limit = 100;
    let total = 0;
    console.log(`[translate-all] Fetching entries for ${id}...`);
    do {
      const res = await env.getEntries({ content_type: id, limit, skip, locale: '*' });
      total = res.total || 0;
      console.log(
        `[translate-all] Found ${total} total entries for ${id}, processing batch ${skip}-${skip + res.items.length}`
      );
      for (const entry of res.items) {
        global.seenEntries++;
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[translate-all] Processing entry ${entry.sys.id} (${id})`);
        }
        const r = await updateEntry(
          env,
          entry.sys.id,
          fieldIds,
          contentTypeForValidation,
          force,
          forcePublish,
          repair
        );
        if (r.updated) {
          global.updated++;
          console.log(`[translate-all] ✓ Updated entry ${entry.sys.id}`);
        }
        if (r.published) {
          global.published++;
          console.log(`[translate-all] ✓ Published entry ${entry.sys.id}`);
        }
        if (!r.updated && !r.published && process.env.NODE_ENV !== 'production') {
          console.log(`[translate-all] - No changes for entry ${entry.sys.id}`);
        }
      }
      skip += res.items.length;
    } while (skip < total);
    console.log(
      `[translate-all] Finished processing ${id}: ${global.seenEntries} seen, ${global.updated} updated, ${global.published} published`
    );
  }

  console.log('All content types finished:', global);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
