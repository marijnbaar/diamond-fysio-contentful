// pages/api/webhooks/contentful-team-member.js
import { createClient } from 'contentful-management';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';

const SPACE_ID = process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CTF_ENV_ID || process.env.ENV_ID || 'master';
const MGMT_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN || process.env.CONTENTFUL_MANAGEMENT_API;
const WEBHOOK_SECRET = process.env.TEAMPAGE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

// optional: precisely name the TeamOverview entry + the collection field id to edit
const TEAM_OVERVIEW_ENTRY_ID = process.env.TEAM_OVERVIEW_ENTRY_ID || '13d7Cj8GPxuvEb7YSosmHH';
const TEAM_OVERVIEW_FIELD_ID = process.env.TEAM_OVERVIEW_FIELD_ID || 'teamMemberCollection'; // Field ID in specialisationHomeOverview
const TEAM_OVERVIEW_CONTENT_TYPE = 'specialisationHomeOverview'; // Content type ID

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

async function translateBatch(texts, targetLang) {
  if (!texts || texts.length === 0) return [];
  try {
    const res = await fetch(`${SITE_URL}/api/translate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, lang: targetLang })
    });
    if (!res.ok) {
      warn('Translation API failed:', res.status, res.statusText);
      return texts;
    }
    const json = await res.json();
    if (!Array.isArray(json.items)) return texts;
    return json.items.map((s, i) => (typeof s === 'string' && s.trim() ? s : texts[i] || ''));
  } catch (error) {
    warn('Translation error:', error?.message || error);
    return texts;
  }
}

function extractTextFromRichText(value) {
  if (!value) return [];
  if (typeof value === 'string') return [{ path: [], text: value }];

  const doc = value?.json?.nodeType === 'document' ? value.json : value;
  if (!doc || typeof doc !== 'object') return [];

  const texts = [];
  function traverse(node, path = []) {
    if (!node || typeof node !== 'object') return;
    if (node.nodeType === 'text' && typeof node.value === 'string' && node.value.trim()) {
      texts.push({ path, text: node.value });
    }
    if (Array.isArray(node.content)) {
      node.content.forEach((child, i) => traverse(child, [...path, 'content', i]));
    }
  }
  traverse(doc);
  return texts;
}

// ✅ FIXED: correctly writes back into each text node's .value (does NOT replace the node)
function updateRichTextWithTranslations(original, translations) {
  if (typeof original === 'string') {
    return translations[0] || original;
  }
  const cloned = JSON.parse(JSON.stringify(original));
  const doc = cloned?.json?.nodeType === 'document' ? cloned.json : cloned;

  const texts = extractTextFromRichText(original);
  texts.forEach(({ path }, idx) => {
    if (!translations[idx]) return;
    let node = doc;
    for (let i = 0; i < path.length; i++) {
      node = node[path[i]];
      if (!node) return;
    }
    if (node && node.nodeType === 'text' && typeof node.value === 'string') {
      node.value = translations[idx];
    }
  });

  return cloned;
}

function verifyWebhook(req) {
  const hasContentfulHeaders =
    Boolean(req.headers['x-contentful-topic']) ||
    Boolean(req.headers['x-contentful-webhook-name']) ||
    Boolean(req.headers['x-contentful-crn']);

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
      .map(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('secret') ||
          lowerKey.includes('auth') ||
          lowerKey.includes('teampage')
        ) {
          return value;
        }
        return null;
      })
      .filter(Boolean)
  ].filter(Boolean);

  log('Checking webhook authentication...');
  log('Contentful headers present:', hasContentfulHeaders);
  log('Possible secret headers found:', possibleSecretHeaders.length);
  log('All request headers:', Object.keys(req.headers || {}));

  if (WEBHOOK_SECRET) {
    const secret = WEBHOOK_SECRET.trim();
    for (const headerValue of possibleSecretHeaders) {
      const value =
        typeof headerValue === 'string' ? headerValue.trim() : String(headerValue || '').trim();
      const normalizedValue = value.replace(/^Bearer\s+/i, '');
      if (normalizedValue === secret || value === secret || value === `Bearer ${secret}`) {
        log('✅ Webhook verified via WEBHOOK_SECRET');
        return true;
      }
    }
    if (hasContentfulHeaders) {
      log(
        '⚠️ WEBHOOK_SECRET is configured but no matching secret header found - accepting based on Contentful headers'
      );
      return true;
    }
    err('Missing or invalid authorization header while WEBHOOK_SECRET is set');
    return false;
  }

  if (!hasContentfulHeaders) {
    err('No Contentful headers and no secret configured');
    return false;
  }
  log('✅ Webhook verified via Contentful headers');
  return true;
}

function getContentTypeId(sys) {
  if (!sys || !sys.contentType) return null;
  if (typeof sys.contentType === 'string') return sys.contentType;
  if (sys.contentType.sys && sys.contentType.sys.id) return sys.contentType.sys.id;
  if (sys.contentType.id) return sys.contentType.id;
  return null;
}

// helpers for publish semantics in Contentful
async function ensurePublished(entry) {
  // If never published
  if (!entry.sys.publishedVersion) {
    const published = await entry.publish();
    return published;
  }
  // If version isn't exactly publishedVersion + 1, there are pending changes or stale object; re-fetch latest and publish
  if (entry.sys.version !== entry.sys.publishedVersion + 1) {
    const fresh = await entry.getEnvironment().then((env) => env.getEntry(entry.sys.id));
    if (fresh.sys.version !== fresh.sys.publishedVersion + 1) {
      const republished = await fresh.publish();
      return republished;
    }
    return fresh; // already up-to-date
  }
  return entry; // already up-to-date & published
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

    // act on entry create/publish events
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

    // CMA
    const client = createClient({ accessToken: MGMT_TOKEN.trim() });
    const space = await client.getSpace(SPACE_ID);
    const env = await space.getEnvironment(ENV_ID);

    // resolve locales
    const locales = await env.getLocales();
    const defaultLocale = (locales.items.find((l) => l.default) || { code: 'en-US' }).code;
    const hasNl = locales.items.some((l) => l.code === 'nl-NL');
    const hasEn = locales.items.some((l) => l.code === 'en-US');
    const nlLocale = hasNl ? 'nl-NL' : null;
    const targetLocale = hasEn ? 'en-US' : defaultLocale; // always try to backfill en-US when possible
    log('Locales:', { defaultLocale, nlLocale, targetLocale });

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
          slug: { [defaultLocale]: teamSlug, ...(nlLocale ? { [nlLocale]: teamSlug } : {}) },
          pageType: {
            [defaultLocale]: 'teampage',
            ...(nlLocale ? { [nlLocale]: 'teampage' } : {})
          },
          title: {
            [defaultLocale]: teamMemberName,
            ...(nlLocale ? { [nlLocale]: teamMemberName } : {})
          },
          teamMember: {
            [defaultLocale]: { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } },
            ...(nlLocale
              ? { [nlLocale]: { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } } }
              : {})
          }
        }
      });

      // If the trigger was an Entry.create, attempt immediate publish
      if (topic.includes('Entry.create')) {
        try {
          about = await about.publish();
          log('Aboutpage published immediately after creation');
        } catch (e) {
          warn('Could not publish Aboutpage immediately after creation:', e?.message || e);
        }
      }
    }

    // Ensure required fields are present & up-to-date
    const ensureField = (obj, key, valueMap) => {
      obj.fields = obj.fields || {};
      obj.fields[key] = obj.fields[key] || {};
      let changed = false;
      for (const [loc, val] of Object.entries(valueMap)) {
        if (val == null) continue;
        const current = obj.fields[key][loc];

        let needsUpdate = false;
        if (current == null) {
          needsUpdate = true;
        } else if (typeof val === 'object' && val !== null && val.sys?.id) {
          needsUpdate = !current?.sys || current.sys.id !== val.sys.id;
        } else if (typeof val === 'object') {
          // deep-ish compare for primitives within objects (simple stringify is ok here)
          needsUpdate = JSON.stringify(current) !== JSON.stringify(val);
        } else {
          needsUpdate = current !== val;
        }

        if (needsUpdate) {
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
        [defaultLocale]: 'teampage',
        ...(nlLocale ? { [nlLocale]: 'teampage' } : {})
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
      about = await about.update();
      log('Aboutpage updated');
    } else {
      log('Aboutpage fields already up-to-date');
    }

    // ✅ publish Aboutpage first (must exist/publish before teamMember references it)
    try {
      // ensurePublished needs an entry object whose getEnvironment() works; attach a shim:
      about.getEnvironment = () => Promise.resolve(env);
      about = await ensurePublished(about);
      log('Aboutpage ensured published:', about.sys.id, 'pv=', about.sys.publishedVersion);
    } catch (error) {
      warn(
        'Ensuring Aboutpage published failed (teamMember publish may fail):',
        error?.message || error
      );
    }

    // Update teamMember.link and translate nl-NL -> en-US where EN is empty
    try {
      const loc = targetLocale;

      const currentId =
        teamMember.fields?.link?.[loc]?.sys?.id ||
        teamMember.fields?.link?.[defaultLocale]?.sys?.id;

      let teamMemberChanged = false;

      // Link to Aboutpage
      if (currentId !== about.sys.id) {
        teamMember.fields = teamMember.fields || {};
        teamMember.fields.link = teamMember.fields.link || {};
        teamMember.fields.link[defaultLocale] = {
          sys: { type: 'Link', linkType: 'Entry', id: about.sys.id }
        };
        if (nlLocale) {
          teamMember.fields.link[nlLocale] = {
            sys: { type: 'Link', linkType: 'Entry', id: about.sys.id }
          };
        }
        if (loc !== defaultLocale) {
          teamMember.fields.link[loc] = {
            sys: { type: 'Link', linkType: 'Entry', id: about.sys.id }
          };
        }
        teamMemberChanged = true;
        log('teamMember.link updated →', about.sys.id);
      }

      // Backfill EN from NL if EN missing and NL exists
      if (nlLocale && hasEn) {
        const fieldsToTranslate = [
          'name',
          'role',
          'descriptionHomepage',
          'descriptionTeampage',
          'contact'
        ];
        const textsToTranslate = [];
        const fieldConfigs = [];

        for (const fieldId of fieldsToTranslate) {
          const field = teamMember.fields?.[fieldId];
          if (!field) continue;

          const nlValue = field[nlLocale];
          const enValue = field['en-US'];

          if (
            nlValue &&
            (enValue == null || (typeof enValue === 'string' && enValue.trim() === ''))
          ) {
            if (fieldId === 'name' || fieldId === 'role') {
              textsToTranslate.push(String(nlValue));
              fieldConfigs.push({ fieldId, type: 'text', nlValue });
            } else {
              const texts = extractTextFromRichText(nlValue);
              if (texts.length > 0) {
                texts.forEach(({ text }) => textsToTranslate.push(text));
                fieldConfigs.push({ fieldId, type: 'richtext', texts, nlValue });
              }
            }
          }
        }

        if (textsToTranslate.length > 0) {
          log(`Translating ${textsToTranslate.length} text segments nl-NL → en-US ...`);
          const translated = await translateBatch(textsToTranslate, 'en');
          let idx = 0;

          for (const cfg of fieldConfigs) {
            if (cfg.type === 'text') {
              const t = translated[idx++];
              if (t) {
                teamMember.fields[cfg.fieldId] = teamMember.fields[cfg.fieldId] || {};
                teamMember.fields[cfg.fieldId]['en-US'] = t;
                teamMemberChanged = true;
              }
            } else {
              const pieceTranslations = cfg.texts.map(() => translated[idx++]);
              const updatedValue = updateRichTextWithTranslations(cfg.nlValue, pieceTranslations);
              teamMember.fields[cfg.fieldId] = teamMember.fields[cfg.fieldId] || {};
              teamMember.fields[cfg.fieldId]['en-US'] = updatedValue;
              teamMemberChanged = true;
            }
          }
        }
      }

      if (teamMemberChanged) {
        await teamMember.update();
        log('TeamMember updated (link/translation)');
      } else {
        log('TeamMember unchanged');
      }
    } catch (error) {
      warn('Could not update teamMember:', error?.message || error);
    }

    // Optionally ensure teamMember is published too (so the site updates)
    try {
      teamMember.getEnvironment = () => Promise.resolve(env);
      const publishedTeamMember = await ensurePublished(teamMember);
      log(
        'TeamMember ensured published:',
        publishedTeamMember.sys.id,
        'pv=',
        publishedTeamMember.sys.publishedVersion
      );
    } catch (e) {
      warn('Could not ensure teamMember published (may be draft intentionally):', e?.message || e);
    }

    // Update TeamOverview collection: add the member if missing and publish the overview
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

        overview = await overview.update();
        // publish with fresh fetch to avoid version conflicts
        const freshOverview = await env.getEntry(TEAM_OVERVIEW_ENTRY_ID);
        freshOverview.getEnvironment = () => Promise.resolve(env);
        await ensurePublished(freshOverview);
        log(`Updated and published ${TEAM_OVERVIEW_CONTENT_TYPE}`);
      } else {
        log(
          `${TEAM_OVERVIEW_CONTENT_TYPE} already contains ${teamMemberId} in ${TEAM_OVERVIEW_FIELD_ID}.`
        );
      }
    } catch (error) {
      warn(`${TEAM_OVERVIEW_CONTENT_TYPE} update skipped/failed:`, error?.message || error);
      warn('Error details:', JSON.stringify(error, null, 2));
    }

    return res.status(200).json({
      success: true,
      aboutpageId: about?.sys?.id || aboutId,
      slug:
        about?.fields?.slug?.[defaultLocale] ||
        (nlLocale ? about?.fields?.slug?.[nlLocale] : null) ||
        teamSlug,
      publishedVersion: about?.sys?.publishedVersion || null
    });
  } catch (error) {
    err('Fatal webhook error:', error?.message || error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error?.message || String(error) });
  }
}
