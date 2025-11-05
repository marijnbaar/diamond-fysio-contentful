// pages/api/webhooks/contentful-team-member.js
import { createClient } from 'contentful-management';

// --- ENV ---
const SPACE_ID = process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CTF_ENV_ID || process.env.ENV_ID || 'master';
const MGMT_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN || process.env.CONTENTFUL_MANAGEMENT_API;
const WEBHOOK_SECRET = process.env.TEAMPAGE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

// (Optional) Team overview entry + field
const TEAM_OVERVIEW_ENTRY_ID = process.env.TEAM_OVERVIEW_ENTRY_ID || '13d7Cj8GPxuvEb7YSosmHH';
const TEAM_OVERVIEW_FIELD_ID = process.env.TEAM_OVERVIEW_FIELD_ID || 'teamMemberCollection';
const TEAM_OVERVIEW_CONTENT_TYPE = 'specialisationHomeOverview';

// --- LOG ---
const log = (...a) => console.log('[team-member webhook]', ...a);
const warn = (...a) => console.warn('[team-member webhook]', ...a);
const err = (...a) => console.error('[team-member webhook]', ...a);

// --- UTILS ---
function createSlugFromName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function verifyWebhook(req) {
  const hasCF =
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
    if (hasCF) return true;
    return false;
  }

  return hasCF;
}

function getContentTypeId(sys) {
  if (!sys?.contentType) return null;
  if (typeof sys.contentType === 'string') return sys.contentType;
  return sys.contentType.sys?.id || sys.contentType.id || null;
}

// --- PUBLISH HELPERS ---
async function ensureEntryPublished(env, entry) {
  if (!entry?.sys) return entry;
  if (!entry.sys.publishedVersion) return entry.publish(); // first publish
  // up-to-date = version === publishedVersion + 1
  if (entry.sys.version !== entry.sys.publishedVersion + 1) {
    const fresh = await env.getEntry(entry.sys.id);
    if (!fresh.sys.publishedVersion || fresh.sys.version !== fresh.sys.publishedVersion + 1) {
      return fresh.publish();
    }
    return fresh;
  }
  return entry;
}

// --- TEAM OVERVIEW UPDATER (robust) ---
async function addMemberToTeamOverview(
  env,
  { overviewEntryId, overviewContentType, collectionFieldId, teamMemberId, defaultLocale, nlLocale }
) {
  // Fetch overview entry
  let overview = await env.getEntry(overviewEntryId);

  // Inspect content type to see if the collection field is localized
  let isLocalized = true; // default to true, correct below
  try {
    const ct = await env.getContentType(overviewContentType);
    const field = (ct.fields || []).find((f) => f.id === collectionFieldId);
    if (field) isLocalized = !!field.localized;
    log(`Team overview field "${collectionFieldId}" localized:`, isLocalized);
  } catch (e) {
    warn('Could not read content type for overview; assuming localized=true:', e?.message || e);
  }

  overview.fields = overview.fields || {};
  overview.fields[collectionFieldId] = overview.fields[collectionFieldId] || {};

  const linkObj = { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } };

  const ensureInArray = (arr) => {
    const base = Array.isArray(arr) ? arr : [];
    const exists = base.some((x) => x?.sys?.id === teamMemberId);
    return exists ? base : [...base, linkObj];
  };

  let changed = false;

  if (isLocalized) {
    // Handle default locale
    const arrDef = overview.fields[collectionFieldId][defaultLocale] || [];
    const nextDef = ensureInArray(arrDef);
    if (nextDef !== arrDef) {
      overview.fields[collectionFieldId][defaultLocale] = nextDef;
      changed = true;
    }
    // Also mirror to nl-NL if present
    if (nlLocale) {
      const arrNl = overview.fields[collectionFieldId][nlLocale] || [];
      const nextNl = ensureInArray(arrNl);
      if (nextNl !== arrNl) {
        overview.fields[collectionFieldId][nlLocale] = nextNl;
        changed = true;
      }
    }
  } else {
    // Non-localized arrays: write only to defaultLocale key
    const arr = overview.fields[collectionFieldId][defaultLocale] || [];
    const next = ensureInArray(arr);
    if (next !== arr) {
      overview.fields[collectionFieldId][defaultLocale] = next;
      changed = true;
    }
  }

  if (changed) {
    overview = await overview.update();
    overview = await ensureEntryPublished(env, overview);
    log(`Team overview "${overviewEntryId}" updated & published.`);
  } else {
    log(`Team overview "${overviewEntryId}" already contained ${teamMemberId}.`);
  }
}

// --- ROUTE ---
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!verifyWebhook(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!SPACE_ID || !MGMT_TOKEN) {
      return res.status(500).json({ error: 'Missing SPACE_ID or MGMT_TOKEN' });
    }

    const topic = String(req.headers['x-contentful-topic'] || '');
    log('Incoming topic:', topic);
    if (!/Entry\.(publish|create)/.test(topic)) {
      return res.status(200).json({ message: 'Skipped: non-handled event' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const { sys = {}, fields = {} } = body;
    const entryId = sys.id;
    if (!entryId) return res.status(400).json({ error: 'Missing sys.id' });

    const ctype = (getContentTypeId(sys) || '').toLowerCase();
    if (ctype !== 'teammember') {
      return res.status(200).json({ message: 'Skipped non-teamMember' });
    }

    // Basics
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

    // Locales
    const locales = await env.getLocales();
    const defaultLocale = (locales.items.find((l) => l.default) || { code: 'en-US' }).code;
    const nlLocale = locales.items.some((l) => l.code === 'nl-NL') ? 'nl-NL' : null;

    // Load teamMember (no translation or link edits)
    await env.getEntry(teamMemberId); // just to assert it exists; not modified here

    // Upsert Aboutpage (no teamMember field; use components array)
    let about;
    try {
      about = await env.getEntry(aboutId);
      log('Found Aboutpage:', aboutId);
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
        }
      });
      log('Created Aboutpage:', aboutId);
    }

    const ensureField = (entry, fieldId, valueMap) => {
      entry.fields = entry.fields || {};
      entry.fields[fieldId] = entry.fields[fieldId] || {};
      let changed = false;
      for (const [loc, val] of Object.entries(valueMap)) {
        if (val == null) continue;
        const cur = entry.fields[fieldId][loc];
        const needs =
          cur == null
            ? true
            : typeof val === 'object'
              ? JSON.stringify(cur) !== JSON.stringify(val)
              : cur !== val;
        if (needs) {
          entry.fields[fieldId][loc] = val;
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

    if (aboutChanged) {
      about = await about.update();
      log('Aboutpage core fields updated');
    }

    // Add teamMember to Aboutpage.components (non-localized field)
    const COMPONENTS_FIELD_ID = 'components';
    about.fields = about.fields || {};
    about.fields[COMPONENTS_FIELD_ID] = about.fields[COMPONENTS_FIELD_ID] || {};
    const arr = about.fields[COMPONENTS_FIELD_ID][defaultLocale] || [];
    const exists = Array.isArray(arr) && arr.some((l) => l?.sys?.id === teamMemberId);
    if (!exists) {
      about.fields[COMPONENTS_FIELD_ID][defaultLocale] = [
        ...arr,
        { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }
      ];
      about = await about.update();
      log('Added teamMember to Aboutpage.components');
    } else {
      log('teamMember already present in Aboutpage.components');
    }

    // Publish Aboutpage
    about = await ensureEntryPublished(env, about);

    // ✅ ADD TO TEAM OVERVIEW (robust, localized-aware)
    try {
      await addMemberToTeamOverview(env, {
        overviewEntryId: TEAM_OVERVIEW_ENTRY_ID,
        overviewContentType: TEAM_OVERVIEW_CONTENT_TYPE,
        collectionFieldId: TEAM_OVERVIEW_FIELD_ID,
        teamMemberId,
        defaultLocale,
        nlLocale
      });
    } catch (e) {
      warn('Team overview update failed:', e?.message || e);
    }

    return res.status(200).json({
      success: true,
      aboutpageId: about?.sys?.id || aboutId,
      slug: about?.fields?.slug?.[defaultLocale] || teamSlug
    });
  } catch (error) {
    err('Fatal webhook error:', error?.message || error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error?.message || String(error) });
  }
}
