// pages/api/webhooks/contentful-team-member.js
import { createClient } from 'contentful-management';

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

function verifyWebhook(req) {
  // Check for Contentful-specific headers
  const hasContentfulHeaders =
    Boolean(req.headers['x-contentful-topic']) ||
    Boolean(req.headers['x-contentful-webhook-name']) ||
    Boolean(req.headers['x-contentful-crn']);

  if (process.env.EMERGENCY_STOP_WEBHOOK === 'true') {
    err('EMERGENCY_STOP_WEBHOOK=true — refusing request');
    return false;
  }

  // Check all possible secret header locations
  const possibleSecretHeaders = [
    req.headers.authorization,
    req.headers['x-contentful-webhook-secret'],
    req.headers['x-webhook-secret'],
    req.headers['webhook-secret'],
    req.headers['teampage-webhook-secret'],
    req.headers['teampage_webhook_secret'],
    req.headers['teampagewebhooksecret'],
    // Also check all headers for any that might contain the secret
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

  // If WEBHOOK_SECRET is set, verify against any found secret headers
  if (WEBHOOK_SECRET) {
    const secret = WEBHOOK_SECRET.trim();

    // Check if any of the possible secret headers match
    for (const headerValue of possibleSecretHeaders) {
      const value =
        typeof headerValue === 'string' ? headerValue.trim() : String(headerValue || '').trim();
      const normalizedValue = value.replace(/^Bearer\s+/i, ''); // Remove "Bearer " prefix if present

      if (normalizedValue === secret || value === secret || value === `Bearer ${secret}`) {
        log('✅ Webhook verified via WEBHOOK_SECRET');
        return true;
      }
    }

    // If no matching secret header found but Contentful headers are present
    if (hasContentfulHeaders) {
      log(
        '⚠️ WEBHOOK_SECRET is configured but no matching secret header found - accepting based on Contentful headers'
      );
      return true;
    }

    err('Missing or invalid authorization header while WEBHOOK_SECRET is set');
    err('Expected secret:', secret.substring(0, 4) + '...');
    err(
      'Found headers:',
      Object.keys(req.headers || {}).filter(
        (k) => k.toLowerCase().includes('secret') || k.toLowerCase().includes('auth')
      )
    );
    return false;
  }

  // If no secret configured, accept only if it looks like Contentful
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
      log('Existing Aboutpage fields:', JSON.stringify(about.fields, null, 2));
    } catch (error) {
      log('Creating Aboutpage with deterministic ID:', aboutId);
      log('Aboutpage fields to create:', {
        slug: { [defaultLocale]: teamSlug },
        pageType: { [defaultLocale]: 'Teammemberpage' },
        title: { [defaultLocale]: teamMemberName },
        teamMember: {
          [defaultLocale]: { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }
        }
      });
      try {
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
        log('Aboutpage created successfully:', about.sys.id);
        log('Created Aboutpage sys:', JSON.stringify(about.sys, null, 2));
        log('Created Aboutpage fields:', JSON.stringify(about.fields, null, 2));
      } catch (createError) {
        err('Failed to create Aboutpage:', createError?.message || createError);
        err('Create error details:', JSON.stringify(createError, null, 2));
        // Check if content type exists
        try {
          const contentType = await env.getContentType('aboutpage');
          log('Content type "aboutpage" exists:', contentType.sys.id);
        } catch (ctError) {
          err('Content type "aboutpage" not found! Error:', ctError?.message || ctError);
          err('This might be the problem - check the content type ID in Contentful');
        }
        throw createError;
      }
    }

    // Ensure required fields (write to default; also mirror to nl-NL if present so you see it in UI)
    const ensureField = (obj, key, valueMap) => {
      obj.fields = obj.fields || {};
      obj.fields[key] = obj.fields[key] || {};
      let changed = false;
      for (const [loc, val] of Object.entries(valueMap)) {
        if (val == null) continue;
        const current = obj.fields[key][loc];
        // For objects/links, compare by id if available, otherwise do deep comparison
        let needsUpdate = false;
        if (current == null) {
          needsUpdate = true;
        } else if (typeof val === 'object' && val !== null && val.sys?.id) {
          // For link objects, compare by sys.id
          needsUpdate = !current.sys || current.sys.id !== val.sys.id;
        } else {
          // For primitives, use strict equality
          needsUpdate = current !== val;
        }
        if (needsUpdate) {
          log(`Updating ${key}[${loc}]:`, current, '→', val);
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
      try {
        about = await about.update();
        log('Aboutpage updated successfully');
      } catch (updateError) {
        err('Failed to update Aboutpage:', updateError?.message || updateError);
        err('Update error details:', JSON.stringify(updateError, null, 2));
        throw updateError;
      }
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
      try {
        const fresh = await env.getEntry(aboutId);
        about = await fresh.publish();
        log('Aboutpage published on retry:', about.sys.id, 'v', about.sys.publishedVersion);
      } catch (retryError) {
        err('Publish retry also failed:', retryError?.message || retryError);
        // Don't throw - continue with other operations
      }
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

    // Update TeamOverview collection (specialisationHomeOverview with teamMemberCollection field)
    try {
      log(`Fetching ${TEAM_OVERVIEW_CONTENT_TYPE} entry: ${TEAM_OVERVIEW_ENTRY_ID}`);
      const overview = await env.getEntry(TEAM_OVERVIEW_ENTRY_ID);
      log(
        `Found ${TEAM_OVERVIEW_CONTENT_TYPE} entry, contentType: ${overview.sys?.contentType?.sys?.id}`
      );

      // Verify it's the correct content type
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
        log(
          `Adding ${teamMemberId} to ${TEAM_OVERVIEW_CONTENT_TYPE}.${TEAM_OVERVIEW_FIELD_ID} and publishing…`
        );
        const updated = await overview.update();
        await updated.publish();
        log(`Successfully updated and published ${TEAM_OVERVIEW_CONTENT_TYPE}`);
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
