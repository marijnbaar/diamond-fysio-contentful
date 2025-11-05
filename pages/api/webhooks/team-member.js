// pages/api/webhooks/contentful-team-member.js
import { createClient } from 'contentful-management';

// --- ENV ---
const SPACE_ID = process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CTF_ENV_ID || process.env.ENV_ID || 'master';
const MGMT_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN || process.env.CONTENTFUL_MANAGEMENT_API;
const WEBHOOK_SECRET = process.env.TEAMPAGE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

// Hard targets for Team Overview
const OVERVIEW_ENTRY_ID = '13d7Cj8GPxuvEb7YSosmHH';
const OVERVIEW_CONTENT_TYPE = 'specialisationHomeOverview';
const OVERVIEW_TEAM_FIELD_ID = 'teamMember'; // non-localized array
const OVERVIEW_TYPE_FIELD_ID = 'overviewType'; // localized Symbol

// --- helpers ---
const log = (...a) => console.log('[team-member webhook]', ...a);
const warn = (...a) => console.warn('[team-member webhook]', ...a);

function okCF(req) {
  const hasCF =
    !!req.headers['x-contentful-topic'] ||
    !!req.headers['x-contentful-webhook-name'] ||
    !!req.headers['x-contentful-crn'];
  if (process.env.EMERGENCY_STOP_WEBHOOK === 'true') return false;
  if (!WEBHOOK_SECRET) return hasCF;
  const secret = WEBHOOK_SECRET.trim();
  const cands = [
    req.headers.authorization,
    req.headers['x-contentful-webhook-secret'],
    req.headers['x-webhook-secret'],
    req.headers['webhook-secret']
  ]
    .filter(Boolean)
    .map((v) => String(v).trim());
  return (
    cands.some(
      (v) => v === secret || v === `Bearer ${secret}` || v.replace(/^Bearer\s+/i, '') === secret
    ) || hasCF
  );
}

function ctypeId(sys) {
  if (!sys?.contentType) return null;
  if (typeof sys.contentType === 'string') return sys.contentType;
  return sys.contentType.sys?.id || sys.contentType.id || null;
}

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensurePublished(env, entry) {
  if (!entry?.sys) return entry;
  if (!entry.sys.publishedVersion) return entry.publish();
  if (entry.sys.version !== entry.sys.publishedVersion + 1) {
    const fresh = await env.getEntry(entry.sys.id);
    if (!fresh.sys.publishedVersion || fresh.sys.version !== fresh.sys.publishedVersion + 1) {
      return fresh.publish();
    }
    return fresh;
  }
  return entry;
}

function ensureField(entry, fieldId, valueMap) {
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
}

// --- route ---
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!okCF(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!SPACE_ID || !MGMT_TOKEN)
      return res.status(500).json({ error: 'Missing SPACE_ID or MGMT_TOKEN' });

    const topic = String(req.headers['x-contentful-topic'] || '');
    if (!/Entry\.(publish|create)/.test(topic)) {
      return res.status(200).json({ message: 'Skipped: non-handled event' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== 'object')
      return res.status(400).json({ error: 'Invalid JSON body' });

    const { sys = {}, fields = {} } = body;
    const teamMemberId = sys.id;
    if (!teamMemberId) return res.status(400).json({ error: 'Missing sys.id' });

    const ct = (ctypeId(sys) || '').toLowerCase();
    if (ct !== 'teammember') {
      return res.status(200).json({ message: 'Skipped non-teamMember' });
    }

    // derive values
    const name =
      (fields.name &&
        (fields.name['nl-NL'] || fields.name.nl || fields.name['en-US'] || fields.name)) ||
      'Unknown';
    const slug = `/team/${slugify(name)}`;
    const aboutId = `aboutpage-team-${teamMemberId}`;

    // CMA setup
    const client = createClient({ accessToken: MGMT_TOKEN.trim() });
    const env = await (await client.getSpace(SPACE_ID)).getEnvironment(ENV_ID);

    // locales
    const locales = await env.getLocales();
    const defaultLocale = (locales.items.find((l) => l.default) || { code: 'en-US' }).code;
    const nlLocale = locales.items.some((l) => l.code === 'nl-NL') ? 'nl-NL' : null;

    // --- 1) Upsert Aboutpage, add teamMember to components (non-localized) ---
    let about;
    try {
      about = await env.getEntry(aboutId);
    } catch {
      about = await env.createEntryWithId('aboutpage', aboutId, {
        fields: {
          slug: { [defaultLocale]: slug, ...(nlLocale ? { [nlLocale]: slug } : {}) },
          pageType: {
            [defaultLocale]: 'Teammemberpage',
            ...(nlLocale ? { [nlLocale]: 'Teammemberpage' } : {})
          },
          title: { [defaultLocale]: name, ...(nlLocale ? { [nlLocale]: name } : {}) }
        }
      });
    }

    let changed = false;
    changed =
      ensureField(about, 'slug', {
        [defaultLocale]: slug,
        ...(nlLocale ? { [nlLocale]: slug } : {})
      }) || changed;
    changed =
      ensureField(about, 'pageType', {
        [defaultLocale]: 'Teammemberpage',
        ...(nlLocale ? { [nlLocale]: 'Teammemberpage' } : {})
      }) || changed;
    changed =
      ensureField(about, 'title', {
        [defaultLocale]: name,
        ...(nlLocale ? { [nlLocale]: name } : {})
      }) || changed;

    // components (non-localized) → write under defaultLocale key
    const COMPONENTS_FIELD_ID = 'components';
    about.fields = about.fields || {};
    about.fields[COMPONENTS_FIELD_ID] = about.fields[COMPONENTS_FIELD_ID] || {};
    const compArr = about.fields[COMPONENTS_FIELD_ID][defaultLocale] || [];
    const compHas = Array.isArray(compArr) && compArr.some((l) => l?.sys?.id === teamMemberId);
    if (!compHas) {
      about.fields[COMPONENTS_FIELD_ID][defaultLocale] = [
        ...compArr,
        { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }
      ];
      changed = true;
    }

    if (changed) about = await about.update();
    about = await ensurePublished(env, about);

    // --- 2) Team overview: add member to teamMember (non-localized) + overviewType=TeamOverview ---
    try {
      let overview = await env.getEntry(OVERVIEW_ENTRY_ID);
      const overviewCt = overview.sys?.contentType?.sys?.id || overview.sys?.contentType;
      if (overviewCt && overviewCt !== OVERVIEW_CONTENT_TYPE) {
        warn(`Overview entry is type ${overviewCt}, expected ${OVERVIEW_CONTENT_TYPE}`);
      }

      // teamMember (non-localized array under defaultLocale key)
      overview.fields = overview.fields || {};
      overview.fields[OVERVIEW_TEAM_FIELD_ID] = overview.fields[OVERVIEW_TEAM_FIELD_ID] || {};
      const arr = overview.fields[OVERVIEW_TEAM_FIELD_ID][defaultLocale] || [];
      const exists = Array.isArray(arr) && arr.some((x) => x?.sys?.id === teamMemberId);
      if (!exists) {
        overview.fields[OVERVIEW_TEAM_FIELD_ID][defaultLocale] = [
          ...arr,
          { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }
        ];
      }

      // overviewType localized → set EN & NL to TeamOverview
      overview.fields[OVERVIEW_TYPE_FIELD_ID] = overview.fields[OVERVIEW_TYPE_FIELD_ID] || {};
      const want = 'TeamOverview';
      const changedTypeEN = overview.fields[OVERVIEW_TYPE_FIELD_ID]['en-US'] !== want;
      if (changedTypeEN) overview.fields[OVERVIEW_TYPE_FIELD_ID]['en-US'] = want;
      const changedTypeNL =
        !!nlLocale && overview.fields[OVERVIEW_TYPE_FIELD_ID][nlLocale] !== want;
      if (changedTypeNL) overview.fields[OVERVIEW_TYPE_FIELD_ID][nlLocale] = want;

      const overviewChanged = !exists || changedTypeEN || changedTypeNL;
      if (overviewChanged) {
        overview = await overview.update();
        overview = await ensurePublished(env, overview);
        log('Team overview updated & published');
      } else {
        log('Team overview already up-to-date');
      }
    } catch (e) {
      warn('Team overview update failed:', e?.message || e);
    }

    // --- 3) Set teamMember.link → Aboutpage (Link to Entry, non-localized) + publish teamMember ---
    try {
      let tm = await env.getEntry(teamMemberId);
      tm.fields = tm.fields || {};
      tm.fields.link = tm.fields.link || {};
      const current = tm.fields.link[defaultLocale]?.sys?.id;
      if (current !== aboutId) {
        tm.fields.link[defaultLocale] = { sys: { type: 'Link', linkType: 'Entry', id: aboutId } };
        tm = await tm.update();
        tm = await ensurePublished(env, tm);
        log('teamMember.link set to Aboutpage and published');
      } else {
        // ensure published anyway
        await ensurePublished(env, tm);
        log('teamMember.link already points to Aboutpage');
      }
    } catch (e) {
      warn('Setting teamMember.link failed:', e?.message || e);
    }

    return res.status(200).json({
      ok: true,
      teamMemberId,
      aboutpageId: about?.sys?.id || aboutId,
      aboutSlug: about?.fields?.slug?.[defaultLocale] || slug,
      overviewId: OVERVIEW_ENTRY_ID
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
