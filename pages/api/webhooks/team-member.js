// pages/api/webhooks/contentful-team-member.js
import { createClient } from 'contentful-management';

const SPACE_ID = process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CTF_ENV_ID || process.env.ENV_ID || 'master';
const MGMT_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN || process.env.CONTENTFUL_MANAGEMENT_API;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

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

  if (process.env.EMERGENCY_STOP_WEBHOOK === 'true') return false;

  if (WEBHOOK_SECRET && authHeader) {
    const s = WEBHOOK_SECRET.trim();
    return (
      authHeader === `Bearer ${s}` ||
      authHeader === s ||
      (typeof authHeader === 'string' && authHeader.trim() === s)
    );
  }

  if (!WEBHOOK_SECRET) {
    return Boolean(req.headers['x-contentful-topic'] || req.headers['x-contentful-webhook-name']);
  }

  return Boolean(req.headers['x-contentful-topic'] || req.headers['x-contentful-webhook-name']);
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
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (process.env.EMERGENCY_STOP_WEBHOOK === 'true') {
      return res.status(503).json({ error: 'Webhook disabled via EMERGENCY_STOP_WEBHOOK' });
    }

    if (!verifyWebhook(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!SPACE_ID || !MGMT_TOKEN) {
      return res
        .status(500)
        .json({ error: 'Missing SPACE_ID or MGMT_TOKEN environment variable(s)' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const topic = String(req.headers['x-contentful-topic'] || '');
    if (!/Entry\.(publish|create)/.test(topic)) {
      return res.status(200).json({ message: 'Skipping: not a publish/create event' });
    }

    const sys = body.sys || {};
    const fields = body.fields || {};
    if (!sys.id) {
      return res.status(400).json({ error: 'Missing sys.id in webhook body' });
    }

    const ctype = (getContentTypeId(sys) || '').toLowerCase();
    if (ctype !== 'teammember') {
      return res.status(200).json({ message: 'Skipping: not a teamMember entry' });
    }

    // Skip republishes to avoid loops
    if (sys.publishedVersion !== undefined && sys.publishedVersion !== null) {
      return res.status(200).json({ message: 'Skipping republish to prevent loops' });
    }

    const teamMemberId = sys.id;
    const teamMemberName =
      (fields.name &&
        (fields.name['nl-NL'] || fields.name.nl || fields.name['en-US'] || fields.name)) ||
      'Unknown';
    const teamSlug = `/team/${createSlugFromName(teamMemberName)}`;

    const client = createClient({ accessToken: MGMT_TOKEN.trim() });
    const space = await client.getSpace(SPACE_ID);
    const env = await space.getEnvironment(ENV_ID);

    // default locale (write everything here so it "sticks")
    const locales = await env.getLocales();
    const defaultLocale =
      (locales.items.find((l) => l.default) && locales.items.find((l) => l.default).code) ||
      'en-US';

    const tm = await env.getEntry(teamMemberId);

    // Idempotent Aboutpage entry ID
    const aboutId = `aboutpage-team-${teamMemberId}`;
    let about = null;

    // Try deterministic id
    try {
      about = await env.getEntry(aboutId);
    } catch {
      // Entry doesn't exist yet, will create below
    }

    // Fallback: older page linked to this team member (migrate to deterministic id next time)
    if (!about) {
      const byLink = await env.getEntries({
        content_type: 'aboutpage',
        links_to_entry: teamMemberId,
        limit: 2
      });
      if (byLink.items.length > 0) {
        about = byLink.items[0];
      }
    }

    // Create deterministically if still missing
    if (!about) {
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

    // Ensure fields are set (idempotent write)
    about.fields = about.fields || {};
    const want = {
      slug: teamSlug,
      pageType: 'Teammemberpage',
      title: teamMemberName,
      teamMemberId
    };

    const haveSlug = about.fields.slug && about.fields.slug[defaultLocale];
    const havePageType = about.fields.pageType && about.fields.pageType[defaultLocale];
    const haveTitle = about.fields.title && about.fields.title[defaultLocale];
    const haveTmId =
      about.fields.teamMember &&
      about.fields.teamMember[defaultLocale] &&
      about.fields.teamMember[defaultLocale].sys &&
      about.fields.teamMember[defaultLocale].sys.id;

    let changed = false;

    if (haveSlug !== want.slug) {
      about.fields.slug = about.fields.slug || {};
      about.fields.slug[defaultLocale] = want.slug;
      changed = true;
    }
    if (havePageType !== want.pageType) {
      about.fields.pageType = about.fields.pageType || {};
      about.fields.pageType[defaultLocale] = want.pageType;
      changed = true;
    }
    if (haveTitle !== want.title) {
      about.fields.title = about.fields.title || {};
      about.fields.title[defaultLocale] = want.title;
      changed = true;
    }
    if (haveTmId !== want.teamMemberId) {
      about.fields.teamMember = about.fields.teamMember || {};
      about.fields.teamMember[defaultLocale] = {
        sys: { type: 'Link', linkType: 'Entry', id: want.teamMemberId }
      };
      changed = true;
    }

    if (changed) {
      about = await about.update();
    }

    const isPublished =
      about.sys.publishedVersion !== undefined && about.sys.publishedVersion !== null;
    if (!isPublished || changed) {
      about = await about.publish();
    }

    // Update teamMember.link silently (do not publish teamMember)
    try {
      const currentLinkId =
        tm.fields &&
        tm.fields.link &&
        tm.fields.link[defaultLocale] &&
        tm.fields.link[defaultLocale].sys &&
        tm.fields.link[defaultLocale].sys.id;

      if (currentLinkId !== about.sys.id) {
        tm.fields = tm.fields || {};
        tm.fields.link = tm.fields.link || {};
        tm.fields.link[defaultLocale] = {
          sys: { type: 'Link', linkType: 'Entry', id: about.sys.id }
        };
        await tm.update();
      }
    } catch (e) {
      console.warn('Could not set teamMember.link:', e && e.message ? e.message : e);
    }

    // Optional: add to TeamOverview (idempotent)
    try {
      const overviewId = process.env.TEAM_OVERVIEW_ENTRY_ID || '13d7Cj8GPxuvEb7YSosmHH';
      let overview = null;

      try {
        overview = await env.getEntry(overviewId);
      } catch {
        // Entry not found, try to find by type
        const search = await env.getEntries({
          content_type: 'specialisationHomeOverview',
          'fields.overviewType': 'TeamOverview',
          limit: 1
        });
        overview = search.items[0] || null;
      }

      if (overview) {
        const locale = defaultLocale;
        const arr =
          (overview.fields &&
            ((overview.fields.teamMember && overview.fields.teamMember[locale]) ||
              (overview.fields.teamMemberCollection &&
                overview.fields.teamMemberCollection[locale]) ||
              (overview.fields.teamMembers && overview.fields.teamMembers[locale]))) ||
          [];

        const exists = arr.some((m) => m && m.sys && m.sys.id === teamMemberId);
        if (!exists) {
          const newArr = [...arr, { sys: { type: 'Link', linkType: 'Entry', id: teamMemberId } }];

          overview.fields = overview.fields || {};
          if (overview.fields.teamMember !== undefined) {
            overview.fields.teamMember[locale] = newArr;
          } else if (overview.fields.teamMemberCollection !== undefined) {
            overview.fields.teamMemberCollection[locale] = newArr;
          } else if (overview.fields.teamMembers !== undefined) {
            overview.fields.teamMembers[locale] = newArr;
          } else {
            overview.fields.teamMember = { [locale]: newArr };
          }

          overview = await overview.update();
          await overview.publish(); // republish is fine; this content type is not "teamMember"
        }
      }
    } catch (e) {
      console.warn('Could not update TeamOverview:', e && e.message ? e.message : e);
    }

    return res.status(200).json({
      success: true,
      teamMemberId,
      teamMemberName,
      slug: teamSlug,
      aboutpageId: about && about.sys && about.sys.id,
      published: Boolean(
        about &&
          about.sys &&
          about.sys.publishedVersion !== undefined &&
          about.sys.publishedVersion !== null
      )
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      details: err && err.message ? err.message : String(err)
    });
  }
}
