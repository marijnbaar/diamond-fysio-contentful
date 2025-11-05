// pages/api/webhooks/contentful-team-member.js
import { createClient } from 'contentful-management';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';

const SPACE_ID = process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CTF_ENV_ID || process.env.ENV_ID || 'master';
const MGMT_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN || process.env.CONTENTFUL_MANAGEMENT_API;
const WEBHOOK_SECRET = process.env.TEAMPAGE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

// Optional: Team overview list
const TEAM_OVERVIEW_ENTRY_ID = process.env.TEAM_OVERVIEW_ENTRY_ID || '13d7Cj8GPxuvEb7YSosmHH';
const TEAM_OVERVIEW_FIELD_ID = process.env.TEAM_OVERVIEW_FIELD_ID || 'teamMemberCollection';
const TEAM_OVERVIEW_CONTENT_TYPE = 'specialisationHomeOverview';

function log(...a) {
  console.log('[team-member webhook]', ...a);
}
function warn(...a) {
  console.warn('[team-member webhook]', ...a);
}
function err(...a) {
  console.error('[team-member webhook]', ...a);
}

function createSlugFromName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function translateBatch(texts, targetLang) {
  if (!texts?.length) return [];
  try {
    const res = await fetch(`${SITE_URL}/api/translate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, lang: targetLang })
    });
    if (!res.ok) return texts;
    const json = await res.json();
    if (!Array.isArray(json.items)) return texts;
    return json.items.map((s, i) => (typeof s === 'string' && s.trim() ? s : texts[i] || ''));
  } catch (e) {
    warn('Translation error:', e?.message || e);
    return texts;
  }
}

function extractTextFromRichText(value) {
  if (!value) return [];
  if (typeof value === 'string') return [{ path: [], text: value }];
  const doc = value?.json?.nodeType === 'document' ? value.json : value;
  if (!doc || typeof doc !== 'object') return [];
  const texts = [];
  (function walk(node, path = []) {
    if (!node || typeof node !== 'object') return;
    if (node.nodeType === 'text' && typeof node.value === 'string' && node.value.trim()) {
      texts.push({ path, text: node.value });
    }
    if (Array.isArray(node.content)) {
      node.content.forEach((child, i) => walk(child, [...path, 'content', i]));
    }
  })(doc);
  return texts;
}

// write back into text nodes' .value (do not replace nodes)
function updateRichTextWithTranslations(original, translations) {
  if (typeof original === 'string') return translations[0] || original;
  const cloned = JSON.parse(JSON.stringify(original));
  const doc = cloned?.json?.nodeType === 'document' ? cloned.json : cloned;
  const texts = extractTextFromRichText(original);
  texts.forEach(({ path }, idx) => {
    const t = translations[idx];
    if (!t) return;
    let node = doc;
    for (let i = 0; i < path.length; i++) {
      node = node[path[i]];
      if (!node) return;
    }
    if (node?.nodeType === 'text' && typeof node.value === 'string') node.value = t;
  });
  return cloned;
}

function verifyWebhook(req) {
  const hasCFHeaders =
    !!req.headers['x-contentful-topic'] ||
    !!req.headers['x-contentful-webhook-name'] ||
    !!req.headers['x-contentful-crn'];

  if (process.env.EMERGENCY_STOP_WEBHOOK === 'true') {
    err('EMERGENCY_STOP_WEBHOOK=true — refusing request');
    return false;
  }

  const possibleSecretHeaders = [
    req.headers.authorization,
    req.headers['x-contentful-webhook-secret'],
    req.headers['x-webhook-secret'],
    req.headers['webhook-secret'],
    req.headers['teampage-webhook-secret'],
    req.headers['teampage_webhook_secret'],
    req.headers['teampagewebhooksecret'],
    ...Object.entries(req.headers || {})
      .map(([k, v]) => (/(secret|auth|teampage)/i.test(k) ? v : null))
      .filter(Boolean)
  ].filter(Boolean);

  if (WEBHOOK_SECRET) {
    const secret = WEBHOOK_SECRET.trim();
    for (const hv of possibleSecretHeaders) {
      const raw = typeof hv === 'string' ? hv.trim() : String(hv || '').trim();
      const normalized = raw.replace(/^Bearer\s+/i, '');
      if (normalized === secret || raw === secret || raw === `Bearer ${secret}`) return true;
    }
    if (hasCFHeaders) return true; // allow if coming from Contentful infra
    return false;
  }

  return hasCFHeaders;
}

function getContentTypeId(sys) {
  if (!sys?.contentType) return null;
  if (typeof sys.contentType === 'string') return sys.contentType;
  return sys.contentType.sys?.id || sys.contentType.id || null;
}

// ---------- graph helpers to find & publish linked refs ----------
const isLink = (v) =>
  v?.sys?.type === 'Link' && (v.sys.linkType === 'Entry' || v.sys.linkType === 'Asset');

function collectLinksFromValue(val, acc) {
  if (!val) return;
  if (Array.isArray(val)) return val.forEach((x) => collectLinksFromValue(x, acc));
  if (typeof val === 'object') {
    if (isLink(val)) {
      const id = val.sys.id;
      if (val.sys.linkType === 'Entry') acc.entryIds.add(id);
      else acc.assetIds.add(id);
      return;
    }
    // RichText embedded links
    if (val?.nodeType === 'document' || val?.json?.nodeType === 'document') {
      const doc = val.json?.nodeType === 'document' ? val.json : val;
      (function walk(node) {
        if (!node) return;
        if (node.data?.target?.sys?.type === 'Link') {
          const t = node.data.target.sys;
          if (t.linkType === 'Entry') acc.entryIds.add(t.id);
          if (t.linkType === 'Asset') acc.assetIds.add(t.id);
        }
        if (Array.isArray(node.content)) node.content.forEach(walk);
      })(doc);
    }
    // generic object walk
    for (const k of Object.keys(val)) collectLinksFromValue(val[k], acc);
  }
}

function collectLinksFromFields(fields) {
  const acc = { entryIds: new Set(), assetIds: new Set() };
  if (!fields) return acc;
  for (const fieldId of Object.keys(fields)) {
    const perLocale = fields[fieldId];
    if (!perLocale || typeof perLocale !== 'object') continue;
    for (const loc of Object.keys(perLocale)) {
      collectLinksFromValue(perLocale[loc], acc);
    }
  }
  return acc;
}

async function ensureEntryPublished(env, entry) {
  // never published
  if (!entry.sys.publishedVersion) return entry.publish();
  // up-to-date is version === publishedVersion + 1
  if (entry.sys.version !== entry.sys.publishedVersion + 1) {
    const fresh = await env.getEntry(entry.sys.id);
    if (!fresh.sys.publishedVersion || fresh.sys.version !== fresh.sys.publishedVersion + 1) {
      return fresh.publish();
    }
    return fresh;
  }
  return entry;
}

async function ensureAssetPublished(env, asset) {
  // Assets might need processing; attempt publish regardless (fails if not processed)
  if (!asset.sys.publishedVersion) return asset.publish();
  if (asset.sys.version !== asset.sys.publishedVersion + 1) {
    const fresh = await env.getAsset(asset.sys.id);
    if (!fresh.sys.publishedVersion || fresh.sys.version !== fresh.sys.publishedVersion + 1) {
      return fresh.publish();
    }
    return fresh;
  }
  return asset;
}

// Recursively publish graph (entries & assets) up to a sane depth to avoid cycles
async function publishGraph(env, rootEntry, maxDepth = 3, seen = new Set()) {
  const queue = [{ entry: rootEntry, depth: 0 }];
  while (queue.length) {
    const { entry, depth } = queue.shift();
    if (!entry || seen.has(entry.sys.id)) continue;
    seen.add(entry.sys.id);

    // First, ensure all linked assets/entries are published
    const links = collectLinksFromFields(entry.fields);
    // assets
    for (const assetId of links.assetIds) {
      try {
        const asset = await env.getAsset(assetId);
        await ensureAssetPublished(env, asset);
      } catch (e) {
        warn(`Asset ${assetId} publish skipped/failed:`, e?.message || e);
      }
    }
    // entries (depth limit)
    if (depth < maxDepth) {
      for (const childId of links.entryIds) {
        if (seen.has(childId)) continue;
        try {
          const child = await env.getEntry(childId);
          queue.push({ entry: child, depth: depth + 1 });
        } catch (e) {
          warn(`Entry ${childId} fetch failed:`, e?.message || e);
        }
      }
    }

    // Now (re)publish this entry
    try {
      await ensureEntryPublished(env, entry);
    } catch (e) {
      warn(`Entry ${entry.sys.id} publish failed:`, e?.message || e);
    }
  }
}

// ---------------------------------------------------------------

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!verifyWebhook(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!SPACE_ID || !MGMT_TOKEN)
      return res.status(500).json({ error: 'Missing SPACE_ID or MGMT_TOKEN' });

    const topic = String(req.headers['x-contentful-topic'] || '');
    log('Incoming topic:', topic);
    if (!/Entry\.(publish|create)/.test(topic)) {
      return res.status(200).json({ message: 'Skipped: non-handled event' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== 'object')
      return res.status(400).json({ error: 'Invalid JSON body' });

    const { sys = {}, fields = {} } = body;
    const entryId = sys.id;
    if (!entryId) return res.status(400).json({ error: 'Missing sys.id' });

    const ctype = (getContentTypeId(sys) || '').toLowerCase();
    if (ctype !== 'teammember') {
      return res.status(200).json({ message: 'Skipped non-teamMember' });
    }

    // basics
    const teamMemberName =
      (fields.name &&
        (fields.name['nl-NL'] || fields.name.nl || fields.name['en-US'] || fields.name)) ||
      'Unknown';
    const teamMemberId = entryId;
    const teamSlug = `/team/${createSlugFromName(teamMemberName)}`;
    const aboutId = `aboutpage-team-${teamMemberId}`;

    // CMA
    const client = createClient({ accessToken: MGMT_TOKEN.trim() });
    const space = await client.getSpace(SPACE_ID);
    const env = await space.getEnvironment(ENV_ID);

    // locales
    const locales = await env.getLocales();
    const defaultLocale = (locales.items.find((l) => l.default) || { code: 'en-US' }).code;
    const hasNl = locales.items.some((l) => l.code === 'nl-NL');
    const hasEn = locales.items.some((l) => l.code === 'en-US');
    const nlLocale = hasNl ? 'nl-NL' : null;

    // Load teamMember (source of truth)
    let teamMember = await env.getEntry(teamMemberId);

    // --- STEP 1: publish teamMember FIRST (no backlink required) ---
    try {
      await publishGraph(env, teamMember, 2); // publish its dependencies first
      teamMember = await env.getEntry(teamMemberId); // refresh
      await ensureEntryPublished(env, teamMember);
      log('Published teamMember first:', teamMemberId);
    } catch (e) {
      warn('TeamMember initial publish failed (will continue):', e?.message || e);
    }

    // --- STEP 2: upsert Aboutpage WITHOUT circular dependency at first ---
    let about;
    try {
      about = await env.getEntry(aboutId);
    } catch {
      about = await env.createEntryWithId('aboutpage', aboutId, {
        fields: {
          slug: { [defaultLocale]: teamSlug, ...(nlLocale ? { [nlLocale]: teamSlug } : {}) },
          pageType: {
            [defaultLocale]: 'teampage',
            ...(nlLocale ? { [nlLocale]: 'teampage' } : {})
          },
          title: {
            [defaultLocale]: teamMemberName,
            ...(nlLocale ? { [nlLocale]: teamMemberName } : {})
          }
          // IMPORTANT: do NOT set teamMember link yet (avoid cycle)
        }
      });
    }

    // Ensure core fields are up-to-date (still no backlink)
    const ensureField = (obj, key, valueMap) => {
      obj.fields = obj.fields || {};
      obj.fields[key] = obj.fields[key] || {};
      let changed = false;
      for (const [loc, val] of Object.entries(valueMap)) {
        if (val == null) continue;
        const cur = obj.fields[key][loc];
        const needs =
          cur == null
            ? true
            : typeof val === 'object'
              ? JSON.stringify(cur) !== JSON.stringify(val)
              : cur !== val;
        if (needs) {
          obj.fields[key][loc] = val;
          changed = true;
        }
      }
      return changed;
    };

    let aboutChanged = false;
    aboutChanged =
      ensureField(about, 'slug', {
        [defaultLocale]: teamSlug,
        ...(nlLocale ? { [nlLocale]: teamSlug } : {})
      }) || aboutChanged;
    aboutChanged =
      ensureField(about, 'pageType', {
        [defaultLocale]: 'teampage',
        ...(nlLocale ? { [nlLocale]: 'teampage' } : {})
      }) || aboutChanged;
    aboutChanged =
      ensureField(about, 'title', {
        [defaultLocale]: teamMemberName,
        ...(nlLocale ? { [nlLocale]: teamMemberName } : {})
      }) || aboutChanged;

    if (aboutChanged) about = await about.update();

    // Publish Aboutpage NOW (it has no teamMember link yet, so no cycle)
    try {
      await ensureEntryPublished(env, about);
      log('Published Aboutpage without backlink:', aboutId);
    } catch (e) {
      warn('Aboutpage publish failed:', e?.message || e);
    }

    // --- STEP 3: add backlink fields safely now that both are published ---
    // 3a) teamMember.link → Aboutpage (then republish teamMember)
    try {
      const linkObj = { sys: { type: 'Link', linkType: 'Entry', id: aboutId } };
      const locsToSet = new Set([defaultLocale]);
      if (nlLocale) locsToSet.add(nlLocale);
      if (hasEn) locsToSet.add('en-US');

      let changed = false;
      teamMember.fields = teamMember.fields || {};
      teamMember.fields.link = teamMember.fields.link || {};

      for (const loc of locsToSet) {
        const cur = teamMember.fields.link[loc];
        if (!cur || cur.sys?.id !== aboutId) {
          teamMember.fields.link[loc] = linkObj;
          changed = true;
        }
      }

      // Backfill EN from NL if EN is empty
      if (nlLocale && hasEn) {
        const fieldsToTranslate = [
          'name',
          'role',
          'descriptionHomepage',
          'descriptionTeampage',
          'contact'
        ];
        const textsToTranslate = [];
        const cfgs = [];
        for (const fid of fieldsToTranslate) {
          const f = teamMember.fields?.[fid];
          if (!f) continue;
          const nlVal = f[nlLocale];
          const enVal = f['en-US'];
          if (nlVal && (enVal == null || (typeof enVal === 'string' && !enVal.trim()))) {
            if (fid === 'name' || fid === 'role') {
              textsToTranslate.push(String(nlVal));
              cfgs.push({ fid, kind: 'text', nlVal });
            } else {
              const texts = extractTextFromRichText(nlVal);
              if (texts.length) {
                texts.forEach(({ text }) => textsToTranslate.push(text));
                cfgs.push({ fid, kind: 'rich', texts, nlVal });
              }
            }
          }
        }
        if (textsToTranslate.length) {
          const translated = await translateBatch(textsToTranslate, 'en');
          let i = 0;
          for (const c of cfgs) {
            if (c.kind === 'text') {
              const t = translated[i++];
              if (t) {
                teamMember.fields[c.fid] = teamMember.fields[c.fid] || {};
                teamMember.fields[c.fid]['en-US'] = t;
                changed = true;
              }
            } else {
              const segs = c.texts.map(() => translated[i++]);
              const updated = updateRichTextWithTranslations(c.nlVal, segs);
              teamMember.fields[c.fid] = teamMember.fields[c.fid] || {};
              teamMember.fields[c.fid]['en-US'] = updated;
              changed = true;
            }
          }
        }
      }

      if (changed) {
        teamMember = await teamMember.update();
      }

      // publish teamMember again with backlink (and its dependencies)
      await publishGraph(env, teamMember, 2);
      teamMember = await env.getEntry(teamMemberId);
      await ensureEntryPublished(env, teamMember);
      log('Republished teamMember with backlink to Aboutpage');
    } catch (e) {
      warn('Failed to set/publish teamMember backlink:', e?.message || e);
    }

    // 3b) Now it’s safe to set Aboutpage.teamMember → teamMember (no cycle issues after both are published)
    try {
      const linkObj = { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } };
      let changed = false;
      about.fields = about.fields || {};
      about.fields.teamMember = about.fields.teamMember || {};
      const locsToSet = new Set([defaultLocale]);
      if (nlLocale) locsToSet.add(nlLocale);

      for (const loc of locsToSet) {
        const cur = about.fields.teamMember[loc];
        if (!cur || cur.sys?.id !== teamMemberId) {
          about.fields.teamMember[loc] = linkObj;
          changed = true;
        }
      }

      if (changed) {
        about = await about.update();
        await ensureEntryPublished(env, about);
        log('Updated & published Aboutpage with teamMember link');
      }
    } catch (e) {
      warn('Failed to set/publish Aboutpage.teamMember:', e?.message || e);
    }

    // --- STEP 4: ensure team overview contains the member ---
    try {
      let overview = await env.getEntry(TEAM_OVERVIEW_ENTRY_ID);
      const typ = overview.sys?.contentType?.sys?.id || overview.sys?.contentType;
      if (typ && typ !== TEAM_OVERVIEW_CONTENT_TYPE) {
        warn(
          `Entry ${TEAM_OVERVIEW_ENTRY_ID} is type ${typ}, expected ${TEAM_OVERVIEW_CONTENT_TYPE}`
        );
      }
      overview.fields = overview.fields || {};
      overview.fields[TEAM_OVERVIEW_FIELD_ID] = overview.fields[TEAM_OVERVIEW_FIELD_ID] || {};
      const arr = overview.fields[TEAM_OVERVIEW_FIELD_ID][defaultLocale] || [];
      const present = Array.isArray(arr) && arr.some((m) => m?.sys?.id === teamMemberId);
      if (!present) {
        overview.fields[TEAM_OVERVIEW_FIELD_ID][defaultLocale] = [
          ...arr,
          { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }
        ];
        if (nlLocale) {
          const arrNl = overview.fields[TEAM_OVERVIEW_FIELD_ID][nlLocale] || [];
          const presentNl = Array.isArray(arrNl) && arrNl.some((m) => m?.sys?.id === teamMemberId);
          if (!presentNl) {
            overview.fields[TEAM_OVERVIEW_FIELD_ID][nlLocale] = [
              ...arrNl,
              { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }
            ];
          }
        }
        overview = await overview.update();
        // publish overview
        await ensureEntryPublished(env, overview);
        log('Updated & published team overview');
      }
    } catch (e) {
      warn('Team overview update skipped/failed:', e?.message || e);
    }

    return res.status(200).json({
      success: true,
      aboutpageId: about?.sys?.id || aboutId,
      slug:
        about?.fields?.slug?.[defaultLocale] ||
        (nlLocale ? about?.fields?.slug?.[nlLocale] : null) ||
        teamSlug,
      teamMemberId
    });
  } catch (error) {
    err('Fatal webhook error:', error?.message || error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error?.message || String(error) });
  }
}
