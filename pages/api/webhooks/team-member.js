// pages/api/webhooks/contentful-team-member.js
import { createClient } from 'contentful-management';

const SPACE_ID = process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CTF_ENV_ID || process.env.ENV_ID || 'master';
const MGMT_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN || process.env.CONTENTFUL_MANAGEMENT_API;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// optional: precisely name the TeamOverview entry + the collection field id to edit
const TEAM_OVERVIEW_ENTRY_ID = process.env.TEAM_OVERVIEW_ENTRY_ID || '13d7Cj8GPxuvEb7YSosmHH';
const TEAM_OVERVIEW_FIELD_ID = process.env.TEAM_OVERVIEW_FIELD_ID || 'teamMember'; // <-- set this!

function log(...args) {
  console.log('[team-member webhook]', ...args);
}
function warn(...args) {
  console.warn('[team-member webhook]', ...args);
}
function err(...args) {
  console.error('[team-member webhook]', ...args);
}

function createSlugFromName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function verifyWebhook(req) {
  const authHeader =
    req.headers.authorization ||
    req.headers['x-contentful-webhook-secret'] ||
    req.headers['teampage_webhook_secret'] ||
    req.headers['teampage-webhook-secret'];

  if (process.env.EMERGENCY_STOP_WEBHOOK === 'true') {
    err('EMERGENCY_STOP_WEBHOOK=true — refusing request');
    return false;
  }

  if (WEBHOOK_SECRET) {
    if (!authHeader) {
      err('Missing authorization header while WEBHOOK_SECRET is set');
      return false;
    }
    const s = WEBHOOK_SECRET.trim();
    const ok =
      authHeader === `Bearer ${s}` ||
      authHeader === s ||
      (typeof authHeader === 'string' && authHeader.trim() === s);
    if (!ok) err('Authorization header does not match WEBHOOK_SECRET');
    return ok;
  }

  // If no secret configured, accept only if it looks like Contentful
  const ok =
    Boolean(req.headers['x-contentful-topic']) || Boolean(req.headers['x-contentful-webhook-name']);
  if (!ok) err('No Contentful headers and no secret');
  return ok;
}

function getContentTypeId(sys) {
  if (!sys || !sys.contentType) return null;
  if (typeof sys.contentType === 'string') return sys.contentType;
  if (sys.contentType.sys && sys.contentType.sys.id) return sys.contentType.sys.id;
  if (sys.contentType.id) return sys.contentType.id;
  return null;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!verifyWebhook(req)) return res.status(401).json({ error: 'Unauthorized' });

    if (!SPACE_ID || !MGMT_TOKEN) {
      return res.status(500).json({ error: 'Missing SPACE_ID or MGMT_TOKEN' });
    }

    const topic = String(req.headers['x-contentful-topic'] || '');
    log('Incoming topic:', topic);

    // We’ll act on any Entry.create/publish (don’t try to be too clever)
    if (!/Entry\.(publish|create)/.test(topic)) {
      log('Skipping — not Entry.create/publish');
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
      log('Skipping — contentType is not teamMember:', ctype);
      return res.status(200).json({ message: 'Skipped non-teamMember' });
    }

    // Prepare values
    const teamMemberName =
      (fields.name &&
        (fields.name['nl-NL'] || fields.name.nl || fields.name['en-US'] || fields.name)) ||
      'Unknown';
    const teamMemberId = entryId;
    const teamSlug = `/team/${createSlugFromName(teamMemberName)}`;
    const aboutId = `aboutpage-team-${teamMemberId}`;

    // CMA client
    const client = createClient({ accessToken: MGMT_TOKEN.trim() });
    const space = await client.getSpace(SPACE_ID);
    const env = await space.getEnvironment(ENV_ID);

    // Resolve locales
    const locales = await env.getLocales();
    const defaultLocale = (locales.items.find((l) => l.default) || { code: 'en-US' }).code;
    const nlLocale = locales.items.some((l) => l.code === 'nl-NL') ? 'nl-NL' : null;
    log('Locales:', { defaultLocale, mirrorNl: nlLocale });

    // Ensure teamMember exists (we also use it to write back .link)
    const teamMember = await env.getEntry(teamMemberId);

    // Upsert Aboutpage deterministically
    let about;
    try {
      about = await env.getEntry(aboutId);
      log('Found existing Aboutpage by deterministic ID:', aboutId);
    } catch {
      log('Creating Aboutpage with deterministic ID:', aboutId);
      about = await env.createEntryWithId('aboutpage', aboutId, {
        fields: {
          slug: { [defaultLocale]: teamSlug },
          pageType: { [defaultLocale]: 'Teammemberpage' },
          title: { [defaultLocale]: teamMemberName },
          teamMember: {
            [defaultLocale]: { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }
          }
        }
      });
    }

    // Ensure required fields (write to default; also mirror to nl-NL if present so you see it in UI)
    const ensureField = (obj, key, valueMap) => {
      obj.fields = obj.fields || {};
      obj.fields[key] = obj.fields[key] || {};
      let changed = false;
      for (const [loc, val] of Object.entries(valueMap)) {
        if (val == null) continue;
        if (!obj.fields[key][loc] || obj.fields[key][loc] !== val) {
          obj.fields[key][loc] = val;
          changed = true;
        }
      }
      return changed;
    };

    let changed = false;
    changed =
      ensureField(about, 'slug', {
        [defaultLocale]: teamSlug,
        ...(nlLocale ? { [nlLocale]: teamSlug } : {})
      }) || changed;
    changed =
      ensureField(about, 'pageType', {
        [defaultLocale]: 'Teammemberpage',
        ...(nlLocale ? { [nlLocale]: 'Teammemberpage' } : {})
      }) || changed;
    changed =
      ensureField(about, 'title', {
        [defaultLocale]: teamMemberName,
        ...(nlLocale ? { [nlLocale]: teamMemberName } : {})
      }) || changed;
    changed =
      ensureField(about, 'teamMember', {
        [defaultLocale]: { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } },
        ...(nlLocale
          ? { [nlLocale]: { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } } }
          : {})
      }) || changed;

    if (changed) {
      log('Updating Aboutpage fields…');
      about = await about.update();
    } else {
      log('Aboutpage fields already up-to-date.');
    }

    // Always publish the Aboutpage (idempotent)
    try {
      log('Publishing Aboutpage…');
      about = await about.publish();
      log('Aboutpage published:', about.sys.id, 'v', about.sys.publishedVersion);
    } catch (error) {
      // If it's already published and version matches, this may throw — try once more via fresh get + publish
      warn('Publish threw, retrying once:', error?.message || error);
      const fresh = await env.getEntry(aboutId);
      about = await fresh.publish();
      log('Aboutpage published on retry:', about.sys.id, 'v', about.sys.publishedVersion);
    }

    // Update teamMember.link (do NOT publish teamMember to avoid re-triggering)
    try {
      const loc = defaultLocale;
      const currentId =
        teamMember.fields &&
        teamMember.fields.link &&
        teamMember.fields.link[loc] &&
        teamMember.fields.link[loc].sys &&
        teamMember.fields.link[loc].sys.id;

      if (currentId !== about.sys.id) {
        teamMember.fields = teamMember.fields || {};
        teamMember.fields.link = teamMember.fields.link || {};
        teamMember.fields.link[loc] = {
          sys: { type: 'Link', linkType: 'Entry', id: about.sys.id }
        };
        if (nlLocale) {
          teamMember.fields.link[nlLocale] = {
            sys: { type: 'Link', linkType: 'Entry', id: about.sys.id }
          };
        }
        log('Updating teamMember.link →', about.sys.id);
        await teamMember.update();
      } else {
        log('teamMember.link already points to Aboutpage.');
      }
    } catch (error) {
      warn('Could not update teamMember.link:', error?.message || error);
    }

    // Update TeamOverview collection (single known field)
    try {
      const overview = await env.getEntry(TEAM_OVERVIEW_ENTRY_ID);
      const loc = defaultLocale;

      overview.fields = overview.fields || {};
      overview.fields[TEAM_OVERVIEW_FIELD_ID] = overview.fields[TEAM_OVERVIEW_FIELD_ID] || {};
      const arr = overview.fields[TEAM_OVERVIEW_FIELD_ID][loc] || [];
      const has = Array.isArray(arr) && arr.some((m) => m && m.sys && m.sys.id === teamMemberId);

      if (!has) {
        const next = [...arr, { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }];
        overview.fields[TEAM_OVERVIEW_FIELD_ID][loc] = next;
        if (nlLocale) {
          const arrNl = overview.fields[TEAM_OVERVIEW_FIELD_ID][nlLocale] || [];
          const hasNl = Array.isArray(arrNl) && arrNl.some((m) => m?.sys?.id === teamMemberId);
          if (!hasNl) {
            overview.fields[TEAM_OVERVIEW_FIELD_ID][nlLocale] = [
              ...arrNl,
              { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }
            ];
          }
        }
        log(`Adding ${teamMemberId} to TeamOverview.${TEAM_OVERVIEW_FIELD_ID} and publishing…`);
        const updated = await overview.update();
        await updated.publish();
      } else {
        log(`TeamOverview already contains ${teamMemberId} in ${TEAM_OVERVIEW_FIELD_ID}.`);
      }
    } catch (error) {
      warn('TeamOverview update skipped/failed:', error?.message || error);
    }

    return res.status(200).json({
      success: true,
      aboutpageId: about?.sys?.id,
      slug: about?.fields?.slug?.[defaultLocale],
      publishedVersion: about?.sys?.publishedVersion || null
    });
  } catch (error) {
    err('Fatal webhook error:', error?.message || error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error?.message || String(error) });
  }
}
