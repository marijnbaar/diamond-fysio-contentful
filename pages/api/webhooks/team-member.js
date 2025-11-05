// pages/api/webhooks/contentful-team-member.js
import { createClient } from 'contentful-management';

// --- ENV ---
const SPACE_ID = process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CTF_ENV_ID || process.env.ENV_ID || 'master';
const MGMT_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN || process.env.CONTENTFUL_MANAGEMENT_API;
const WEBHOOK_SECRET = process.env.TEAMPAGE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

// Optioneel: team-overzicht (laat staan als je deze nog gebruikt; anders verwijderen)
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
    if (hasCF) return true; // extra mildness voor Contentful infra
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
  // nooit gepubliceerd
  if (!entry.sys.publishedVersion) return entry.publish();
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

    // Basiswaarden
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
    const hasNl = locales.items.some((l) => l.code === 'nl-NL');
    const nlLocale = hasNl ? 'nl-NL' : null;

    // Haal teamMember op (maar bewerk hem niet: geen vertaling/geen link-veld)
    const teamMember = await env.getEntry(teamMemberId);

    // --- Aboutpage upsert (zonder teamMember veld) ---
    let about;
    try {
      about = await env.getEntry(aboutId);
      log('Found existing Aboutpage by deterministic ID:', aboutId);
    } catch {
      log('Creating Aboutpage with deterministic ID:', aboutId);
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
          // Belangrijk: GEEN about.fields.teamMember meer
          // Secties/Components veld vullen we hieronder
        }
      });
    }

    // Zorg dat essentiële velden kloppen
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
    } else {
      log('Aboutpage core fields already up-to-date');
    }

    // --- Team member in Secties (components) zetten ---
    // components is NIET gelokaliseerd → enkel defaultLocale vullen
    const COMPONENTS_FIELD_ID = 'components';
    about.fields = about.fields || {};
    about.fields[COMPONENTS_FIELD_ID] = about.fields[COMPONENTS_FIELD_ID] || {};
    const current = about.fields[COMPONENTS_FIELD_ID][defaultLocale] || [];
    const exists = Array.isArray(current) && current.some((l) => l?.sys?.id === teamMemberId);

    if (!exists) {
      const next = [...current, { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }];
      about.fields[COMPONENTS_FIELD_ID][defaultLocale] = next;
      // expliciet NIET lokaliseren (veld is non-localized)
      about = await about.update();
      log('Added teamMember to Aboutpage.components');
    } else {
      log('teamMember already present in Aboutpage.components');
    }

    // Publiceer Aboutpage
    try {
      about = await ensureEntryPublished(env, about);
      log('Aboutpage ensured published:', about.sys.id, 'pv=', about.sys.publishedVersion);
    } catch (e) {
      warn('Aboutpage publish failed:', e?.message || e);
    }

    // --- (Optioneel) Team-overzicht aanvullen + publiceren ---
    try {
      log(`Fetching ${TEAM_OVERVIEW_CONTENT_TYPE} entry: ${TEAM_OVERVIEW_ENTRY_ID}`);
      let overview = await env.getEntry(TEAM_OVERVIEW_ENTRY_ID);

      const overviewType = overview.sys?.contentType?.sys?.id || overview.sys?.contentType;
      if (overviewType && overviewType !== TEAM_OVERVIEW_CONTENT_TYPE) {
        warn(
          `Entry ${TEAM_OVERVIEW_ENTRY_ID} is not a ${TEAM_OVERVIEW_CONTENT_TYPE}, it's ${overviewType}`
        );
      }

      const loc = defaultLocale;
      overview.fields = overview.fields || {};
      overview.fields[TEAM_OVERVIEW_FIELD_ID] = overview.fields[TEAM_OVERVIEW_FIELD_ID] || {};
      const arr = overview.fields[TEAM_OVERVIEW_FIELD_ID][loc] || [];
      const has = Array.isArray(arr) && arr.some((m) => m?.sys?.id === teamMemberId);

      if (!has) {
        overview.fields[TEAM_OVERVIEW_FIELD_ID][loc] = [
          ...arr,
          { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }
        ];
        overview = await overview.update();
        overview = await ensureEntryPublished(env, overview);
        log(`Updated & published ${TEAM_OVERVIEW_CONTENT_TYPE}`);
      } else {
        log(
          `${TEAM_OVERVIEW_CONTENT_TYPE} already contains ${teamMemberId} in ${TEAM_OVERVIEW_FIELD_ID}.`
        );
      }
    } catch (e) {
      warn(`${TEAM_OVERVIEW_CONTENT_TYPE} update skipped/failed:`, e?.message || e);
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
