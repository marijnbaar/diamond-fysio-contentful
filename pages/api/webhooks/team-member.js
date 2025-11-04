import { createClient } from 'contentful-management';

const SPACE_ID = process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CTF_ENV_ID || process.env.ENV_ID || 'master';
const MGMT_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN || process.env.CONTENTFUL_MANAGEMENT_API;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Helper om slug te genereren van naam
function createSlugFromName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Verwijder diacritics
    .replace(/[^a-z0-9]+/g, '-') // Vervang non-alphanumeric met -
    .replace(/^-+|-+$/g, ''); // Verwijder leading/trailing -
}

// Verify webhook signature (Contentful gebruikt X-Contentful-Topic header en body signature)
function verifyWebhook(req) {
  // Check for authorization header first (if configured in Contentful webhook settings)
  // Support multiple header formats:
  // 1. Authorization header (standard): Authorization: Bearer {secret}
  // 2. Custom secret header: TEAMPAGE_WEBHOOK_SECRET: {secret}
  // 3. X-Contentful-Webhook-Secret header (alternative)
  const authHeader =
    req.headers.authorization ||
    req.headers['x-contentful-webhook-secret'] ||
    req.headers['teampage_webhook_secret'] ||
    req.headers['teampage-webhook-secret'];

  // If WEBHOOK_SECRET is set and authorization header is present, verify it
  if (WEBHOOK_SECRET && authHeader) {
    // Check both formats: "Bearer {secret}" and just "{secret}"
    const isValid =
      authHeader === `Bearer ${WEBHOOK_SECRET}` ||
      authHeader === WEBHOOK_SECRET ||
      authHeader.trim() === WEBHOOK_SECRET.trim();
    if (isValid) {
      console.log('✅ Webhook secret verified');
      return true;
    }
    // If secret doesn't match, reject
    console.error('❌ Authorization header does not match WEBHOOK_SECRET');
    console.error(`   Expected: ${WEBHOOK_SECRET.substring(0, 10)}...`);
    console.error(`   Received: ${authHeader.substring(0, 10)}...`);
    return false;
  }

  // If no WEBHOOK_SECRET is configured, verify it's actually a Contentful webhook
  // by checking for Contentful-specific headers
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️  WEBHOOK_SECRET niet geconfigureerd - verificatie via Contentful headers');
    const hasContentfulHeaders =
      req.headers['x-contentful-topic'] || req.headers['x-contentful-webhook-name'];
    if (hasContentfulHeaders) {
      console.log('✅ Contentful webhook headers gevonden - request geaccepteerd');
      return true;
    }
    console.error('❌ Geen Contentful headers gevonden en geen authorization header');
    return false;
  }

  // If WEBHOOK_SECRET is set but no authorization header, check Contentful headers as fallback
  // This allows webhooks to work even if authorization header wasn't configured in Contentful
  const hasContentfulHeaders =
    req.headers['x-contentful-topic'] || req.headers['x-contentful-webhook-name'];
  if (hasContentfulHeaders) {
    console.warn(
      '⚠️  WEBHOOK_SECRET is geconfigureerd maar geen authorization header - accepteer op basis van Contentful headers'
    );
    return true;
  }

  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 🚨 EMERGENCY KILL SWITCH: Als deze environment variable is ingesteld, stop de webhook
  // Gebruik dit als laatste redmiddel om loops te stoppen
  // Set EMERGENCY_STOP_WEBHOOK=true in Vercel environment variables
  if (process.env.EMERGENCY_STOP_WEBHOOK === 'true') {
    console.error('🚨 EMERGENCY STOP: Webhook is uitgeschakeld via EMERGENCY_STOP_WEBHOOK');
    return res.status(503).json({
      error: 'Webhook temporarily disabled',
      message: 'EMERGENCY_STOP_WEBHOOK is enabled. Disable this in Vercel to re-enable the webhook.'
    });
  }

  // Verify webhook
  if (!verifyWebhook(req)) {
    console.error('❌ Webhook verificatie gefaald');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Early return: Check Content-Type header to prevent processing non-teamMember entries
  // This is a fast check before we parse the body
  const contentTypeHeader = req.headers['x-contentful-topic'];
  console.log(`📬 Incoming webhook topic: ${contentTypeHeader}`);

  // If this is clearly not a teamMember-related event, skip early
  // This prevents loops when we publish the aboutpage ourselves

  try {
    // Next.js doesn't auto-parse custom Content-Type headers like Contentful's
    // application/vnd.contentful.management.v1+json
    // So we need to manually parse if it's a string
    let body = req.body;

    // If body is a string, parse it as JSON
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
        console.log('✅ Body parsed from string to JSON');
      } catch (parseError) {
        console.error('❌ Failed to parse body as JSON:', parseError.message);
        return res.status(400).json({
          error: 'Invalid JSON body',
          parseError: parseError.message
        });
      }
    }

    // Debug: log de volledige request body om te zien wat Contentful stuurt
    console.log('🔍 Full webhook request body:');
    console.log(JSON.stringify(body, null, 2));
    console.log('🔍 Request body type:', typeof body);
    console.log('🔍 Request body keys:', Object.keys(body || {}));
    console.log('🔍 Webhook headers:');
    console.log('  X-Contentful-Topic:', req.headers['x-contentful-topic']);
    console.log('  X-Contentful-Webhook-Name:', req.headers['x-contentful-webhook-name']);
    console.log('  Content-Type:', req.headers['content-type']);

    // Check if body is properly parsed
    if (!body || typeof body !== 'object') {
      console.error('❌ Request body is not a valid object!');
      return res.status(400).json({
        error: 'Invalid request body',
        bodyType: typeof body,
        body: body
      });
    }

    const { sys, fields } = body;

    // Extra check: ensure sys exists
    if (!sys) {
      console.error('❌ sys object niet gevonden in request body!');
      return res.status(400).json({
        error: 'sys object missing in request body',
        bodyKeys: Object.keys(req.body || {})
      });
    }

    // Debug: log de volledige sys structuur om te zien wat er binnenkomt
    console.log('🔍 Webhook sys object:');
    console.log('  sys:', JSON.stringify(sys, null, 2));
    console.log('  sys.id:', sys?.id);
    console.log('  sys.contentType:', JSON.stringify(sys?.contentType, null, 2));
    console.log('  sys.contentType?.sys?.id:', sys?.contentType?.sys?.id);
    console.log('  sys.contentType?.sys?.linkType:', sys?.contentType?.sys?.linkType);
    console.log('  sys.contentType?.sys?.type:', sys?.contentType?.sys?.type);
    console.log('  Full sys object keys:', Object.keys(sys || {}));

    // Check of dit een TeamMember entry is
    // Contentful kan verschillende formaten gebruiken voor contentType
    // Soms is contentType een Link object, soms een volledige content type object
    let contentTypeId = null;

    // Debug: check alle mogelijke formaten
    console.log('🔍 ContentType detection:');
    console.log('  sys.contentType exists:', !!sys?.contentType);
    console.log('  sys.contentType type:', typeof sys?.contentType);
    console.log('  sys.contentType.sys exists:', !!sys?.contentType?.sys);
    console.log('  sys.contentType.sys.id:', sys?.contentType?.sys?.id);
    console.log('  sys.contentType.id:', sys?.contentType?.id);
    console.log('  sys.contentType (full):', JSON.stringify(sys?.contentType, null, 2));

    if (sys?.contentType) {
      // Probeer verschillende formaten - let op de volgorde!
      if (sys.contentType.sys?.id) {
        contentTypeId = sys.contentType.sys.id;
        console.log('✅ ContentType ID gevonden via sys.contentType.sys.id');
      } else if (sys.contentType.id) {
        contentTypeId = sys.contentType.id;
        console.log('✅ ContentType ID gevonden via sys.contentType.id');
      } else if (typeof sys.contentType === 'string') {
        contentTypeId = sys.contentType;
        console.log('✅ ContentType ID gevonden als string');
      } else {
        console.log('⚠️  ContentType bestaat maar ID niet gevonden');
      }
    } else {
      console.log('⚠️  sys.contentType bestaat niet');
    }

    // Als contentType nog steeds null is, probeer het op te halen via de Management API
    // Dit kan nodig zijn als Contentful alleen een Link stuurt zonder id
    // OF als de webhook op alle entries triggert (zonder filter)
    if (!contentTypeId && sys?.id) {
      console.log(
        '⚠️  ContentType ID niet gevonden in webhook body, proberen via Management API...'
      );
      try {
        // Initialize client (hergebruik later als nodig)
        const client = createClient({ accessToken: MGMT_TOKEN });
        const space = await client.getSpace(SPACE_ID);
        const env = await space.getEnvironment(ENV_ID);
        const entry = await env.getEntry(sys.id);
        contentTypeId = entry.sys.contentType.sys.id;
        console.log(`✅ ContentType ID opgehaald via Management API: "${contentTypeId}"`);

        // Store client for later use (avoid re-initialization)
        req.contentfulClient = { client, space, env };
      } catch (apiError) {
        console.error('❌ Kon entry niet ophalen via Management API:', apiError.message);
        console.error('   Stack:', apiError.stack);
      }
    }

    console.log(`🔍 Detected contentType ID: "${contentTypeId}"`);

    // Normalize content type ID for comparison (case-insensitive)
    const normalizedContentTypeId = contentTypeId?.toLowerCase();
    const expectedContentTypeId = 'teamMember'.toLowerCase();

    // IMPORTANT: Only process teamMember entries to prevent loops
    // If this is not a teamMember entry, skip it immediately
    if (!contentTypeId || normalizedContentTypeId !== expectedContentTypeId) {
      console.log(
        `ℹ️  Webhook ontvangen voor content type "${contentTypeId}" (normalized: "${normalizedContentTypeId}"), verwacht "teamMember" - overslaan`
      );
      return res.status(200).json({
        message: 'Not a team member entry, skipping',
        receivedContentType: contentTypeId,
        normalizedContentType: normalizedContentTypeId,
        sysId: sys?.id
      });
    }

    // CRITICAL: Double check to prevent loops
    // Only process teamMember entries - ignore aboutpage, specialisationHomeOverview, etc.
    // This prevents infinite loops when we publish the aboutpage ourselves
    const contentTypeIdFromSys = sys?.contentType?.sys?.id;
    const isTeamMember =
      contentTypeId === 'teamMember' ||
      contentTypeIdFromSys === 'teamMember' ||
      normalizedContentTypeId === 'teammember';

    if (!isTeamMember) {
      console.log('⚠️  CRITICAL: Dit is GEEN teamMember entry - overslaan om loop te voorkomen');
      console.log(
        `   contentTypeId: ${contentTypeId}, contentTypeFromSys: ${contentTypeIdFromSys}`
      );
      return res.status(200).json({
        message: 'Not a team member entry - skipping to prevent loops',
        receivedContentType: contentTypeId,
        contentTypeFromSys: contentTypeIdFromSys
      });
    }

    // Check of dit een create/publish event is
    const topic = req.headers['x-contentful-topic'];
    console.log(`📬 Webhook topic: ${topic}`);

    // Only process Entry.publish and Entry.create events for teamMember entries
    // Skip Entry.update, Entry.archive, Entry.unarchive, etc. to prevent loops
    if (!topic || (!topic.includes('Entry.publish') && !topic.includes('Entry.create'))) {
      console.log(
        `ℹ️  Webhook event: ${topic} - overslaan (alleen publish/create worden verwerkt)`
      );
      return res.status(200).json({
        message: 'Event type not handled, skipping',
        topic: topic
      });
    }

    // Additional safety: Check if this is an update event (which we should ignore to prevent loops)
    // Contentful sometimes sends Entry.publish for updates too, but we only want initial publishes
    // We can check the revision number - if it's > 1, it's likely an update, not a create
    // CRITICAL: Als de entry al een publishedVersion heeft EN revision > publishedVersion,
    // dan is dit een republish (update), niet een nieuwe entry. We moeten dit checken om loops te voorkomen.
    if (topic.includes('Entry.publish')) {
      const revision = sys?.revision || 1;
      const publishedVersion = sys?.publishedVersion;

      // Als er al een publishedVersion bestaat en revision > publishedVersion, dan is dit een republish
      // Dit gebeurt wanneer we de teamMember entry updaten en publiceren - we moeten dit SKIPPEN
      if (publishedVersion && revision > publishedVersion) {
        console.log(
          `⚠️  Entry heeft revision ${revision} en publishedVersion ${publishedVersion} - dit is een REPUBLISH (update)`
        );
        console.log(`   ⚠️  SKIPPEN om webhook loop te voorkomen`);
        return res.status(200).json({
          message: 'Republish event skipped to prevent loops',
          revision: revision,
          publishedVersion: publishedVersion,
          reason:
            'This is a republish event, not an initial publish. Skipping to prevent infinite loops.'
        });
      }

      if (revision > 1) {
        console.log(
          `ℹ️  Entry heeft revision ${revision} - dit is waarschijnlijk een update, niet een create`
        );
        // We process it anyway, but log it for debugging
      }
    }

    const teamMemberId = sys.id;
    const teamMemberName =
      fields?.name?.['nl-NL'] || fields?.name?.['nl'] || fields?.name || 'Unknown';

    console.log(`🚀 Team member webhook ontvangen voor: ${teamMemberName} (${teamMemberId})`);

    // Check if Management API token is configured
    if (!MGMT_TOKEN) {
      console.error('❌ Management API token environment variable niet geconfigureerd!');
      return res.status(500).json({
        error: 'Management API token not configured',
        details:
          'Please set one of these environment variables in Vercel: CTF_MANAGEMENT_TOKEN, CMAACCESSTOKEN, CONTENTFUL_ACCESS_TOKEN, or CONTENTFUL_MANAGEMENT_API'
      });
    }

    if (!SPACE_ID) {
      console.error(
        '❌ CTF_SPACE_ID of CONTENTFUL_SPACE_ID environment variable niet geconfigureerd!'
      );
      return res.status(500).json({
        error: 'Space ID not configured',
        details: 'Please set CTF_SPACE_ID or CONTENTFUL_SPACE_ID environment variable in Vercel'
      });
    }

    // Initialize Contentful Management API client (hergebruik als al geïnitialiseerd)
    let client, space, env;
    if (req.contentfulClient) {
      ({ client, space, env } = req.contentfulClient);
      console.log('✅ Hergebruik van bestaande Contentful client');
    } else {
      try {
        // Debug: log welke token wordt gebruikt (maar niet de volledige token voor security)
        console.log('🔍 Management API token check:');
        console.log('  Token length:', MGMT_TOKEN ? MGMT_TOKEN.length : 0);
        console.log(
          '  Token starts with:',
          MGMT_TOKEN ? MGMT_TOKEN.substring(0, 10) + '...' : 'null'
        );
        console.log(
          '  Token ends with:',
          MGMT_TOKEN ? '...' + MGMT_TOKEN.substring(MGMT_TOKEN.length - 10) : 'null'
        );
        console.log('  Space ID:', SPACE_ID);
        console.log('  Environment ID:', ENV_ID);

        // Check if token has whitespace (common issue)
        if (MGMT_TOKEN && MGMT_TOKEN !== MGMT_TOKEN.trim()) {
          console.warn('⚠️  WARNING: Token bevat whitespace! Dit kan problemen veroorzaken.');
        }

        client = createClient({ accessToken: MGMT_TOKEN.trim() });
        space = await client.getSpace(SPACE_ID);
        env = await space.getEnvironment(ENV_ID);
        console.log('✅ Nieuwe Contentful client geïnitialiseerd');
      } catch (clientError) {
        console.error('❌ Kon Contentful client niet initialiseren:', clientError.message);
        console.error('   Error details:', JSON.stringify(clientError, null, 2));

        // Check if it's a 403 error specifically
        if (
          (clientError.message && clientError.message.includes('403')) ||
          (clientError.details && clientError.details.status === 403)
        ) {
          return res.status(500).json({
            error: 'Contentful Management API authentication failed',
            details:
              'The access token is invalid or expired. Please verify: 1) The token is a Content Management API token (not Content Delivery), 2) The token is still valid and not revoked, 3) The token has no extra spaces or characters, 4) You have redeployed after adding the environment variable.'
          });
        }

        return res.status(500).json({
          error: 'Failed to initialize Contentful client',
          details: clientError.message.includes('accessToken')
            ? 'Invalid or missing Management API token. Check CTF_MANAGEMENT_TOKEN, CMAACCESSTOKEN, CONTENTFUL_ACCESS_TOKEN, or CONTENTFUL_MANAGEMENT_API.'
            : clientError.message
        });
      }
    }

    // CRITICAL: Check of er al een Aboutpage bestaat voor deze team member
    // Dit voorkomt dat we meerdere pagina's aanmaken voor dezelfde team member
    // Nieuwe pagina's worden ALLEEN aangemaakt als er nog geen pagina bestaat
    console.log(`🔍 Zoeken naar bestaande Aboutpage voor team member ${teamMemberId}...`);

    // Haal teamMember entry op om data te gebruiken
    let teamMemberEntry = null;
    let teamMemberCreatedAt = null;
    try {
      teamMemberEntry = await env.getEntry(teamMemberId);
      teamMemberCreatedAt = teamMemberEntry.sys.createdAt;
      console.log(`📅 Team member entry created at: ${teamMemberCreatedAt}`);
    } catch (err) {
      console.warn(`⚠️  Kon team member entry niet ophalen: ${err.message}`);
      return res.status(500).json({
        error: 'Could not fetch team member entry',
        details: err.message
      });
    }

    // CRITICAL: Haal ALLE aboutpages op (zowel published als unpublished) en filter client-side
    // Contentful's nested query syntax werkt niet goed voor 'fields.teamMember.sys.id'
    // We moeten alle pages ophalen en dan filteren op teamMember link
    // BELANGRIJK: Haal zowel published als unpublished entries op om timing issues te voorkomen
    console.log(`🔍 Ophalen alle Aboutpages met pageType Teammemberpage...`);

    // Haal ALLE aboutpages op (geen filter op pageType in query, filter client-side)
    // Dit voorkomt dat we pages missen die net zijn aangemaakt maar nog niet alle fields hebben
    const allAboutPages = await env.getEntries({
      content_type: 'aboutpage',
      limit: 1000 // Haal veel op om zeker te zijn dat we alles vinden
    });

    // Filter client-side op pageType EN teamMember link
    const existingPages = {
      items: allAboutPages.items.filter((page) => {
        // Check pageType
        const pageType =
          page.fields?.pageType?.['nl-NL'] ||
          page.fields?.pageType?.['nl'] ||
          page.fields?.pageType?.['en-US'] ||
          page.fields?.pageType;

        if (pageType !== 'Teammemberpage') {
          return false;
        }

        // Check teamMember link - probeer alle mogelijke locale formats
        const pageTeamMemberId =
          page.fields?.teamMember?.['nl-NL']?.sys?.id ||
          page.fields?.teamMember?.['nl']?.sys?.id ||
          page.fields?.teamMember?.['en-US']?.sys?.id ||
          page.fields?.teamMember?.sys?.id;

        return pageTeamMemberId === teamMemberId;
      })
    };

    console.log(`📊 ${allAboutPages.items.length} Aboutpages totaal gevonden`);
    console.log(
      `📊 ${existingPages.items.length} bestaande Aboutpage(s) gevonden voor team member ${teamMemberId}`
    );

    // SAFETY: Als er meer dan 1 page is, log dit als waarschuwing
    if (existingPages.items.length > 1) {
      console.warn(
        `⚠️  WAARSCHUWING: ${existingPages.items.length} Aboutpages gevonden voor team member ${teamMemberId}!`
      );
      console.warn(`   Dit kan duiden op een loop. Check de volgende entry IDs:`);
      existingPages.items.forEach((page, index) => {
        console.warn(
          `   ${index + 1}. ${page.sys.id} (slug: ${page.fields?.slug?.['nl-NL'] || 'N/A'})`
        );
      });
    }

    let teamMemberPage;
    let isNewPage = false;

    if (existingPages.items.length > 0) {
      // ER BESTAAT AL EEN PAGINA - UPDATE ALLEEN, MAAK GEEN NIEUWE
      // Gebruik de eerste (meest recente) page
      // Sorteer op createdAt om de nieuwste te krijgen
      const sortedPages = existingPages.items.sort((a, b) => {
        const dateA = new Date(a.sys.createdAt);
        const dateB = new Date(b.sys.createdAt);
        return dateB - dateA; // Nieuwste eerst
      });

      teamMemberPage = sortedPages[0];
      isNewPage = false; // CRITICAL: Zet isNewPage expliciet op false
      console.log(`✅ Bestaande Aboutpage (Teammemberpage) gevonden: ${teamMemberPage.sys.id}`);
      console.log(`   Created: ${teamMemberPage.sys.createdAt}`);
      console.log(`   Slug: ${teamMemberPage.fields?.slug?.['nl-NL'] || 'N/A'}`);
      console.log(`   ⚠️  GEEN nieuwe pagina aangemaakt - bestaande pagina wordt geüpdatet`);

      // SAFETY: Als er duplicates zijn, log maar gebruik de nieuwste
      if (existingPages.items.length > 1) {
        console.warn(
          `⚠️  WAARSCHUWING: ${existingPages.items.length} pages gevonden voor team member ${teamMemberId}!`
        );
        console.warn(
          `   Dit kan duiden op een loop. Gebruik de nieuwste: ${teamMemberPage.sys.id}`
        );
        console.warn(`   Andere pages:`);
        sortedPages.slice(1).forEach((page, index) => {
          console.warn(`     ${index + 2}. ${page.sys.id} (created: ${page.sys.createdAt})`);
        });
      }
    } else {
      // ER BESTAAT GEEN PAGINA - MAAK NIEUWE AAN (alleen voor nieuwe team members)
      console.log(`✨ GEEN bestaande Aboutpage gevonden - dit is een NIEUWE team member`);
      console.log(`   Nieuwe pagina wordt aangemaakt...`);
      isNewPage = true;
      // Create nieuwe Aboutpage met pageType Teammemberpage
      // SAFETY: Check eerst of er misschien een page is met dezelfde slug
      const slug = `/team/${createSlugFromName(teamMemberName)}`;

      console.log(`🔍 Checken of er al een page bestaat met slug: ${slug}...`);
      const pagesWithSameSlug = await env.getEntries({
        content_type: 'aboutpage',
        'fields.slug': slug,
        limit: 1
      });

      if (pagesWithSameSlug.items.length > 0) {
        const existingPageWithSlug = pagesWithSameSlug.items[0];
        console.warn(`⚠️  Page met slug ${slug} bestaat al: ${existingPageWithSlug.sys.id}`);
        console.warn(`   Content type: ${existingPageWithSlug.sys.contentType.sys.id}`);
        console.warn(`   Page type: ${existingPageWithSlug.fields?.pageType?.['nl-NL'] || 'N/A'}`);

        // Als de page al bestaat maar niet gelinkt is aan deze team member, gebruik die
        if (existingPageWithSlug.fields?.pageType?.['nl-NL'] === 'Teammemberpage') {
          console.log(`✅ Bestaande page gevonden met slug - hergebruik deze`);
          teamMemberPage = existingPageWithSlug;
        } else {
          // Page bestaat maar is niet voor team member - maak nieuwe met unieke slug
          const uniqueSlug = `${slug}-${Date.now()}`;
          console.warn(`⚠️  Slug conflict - gebruik unieke slug: ${uniqueSlug}`);
          teamMemberPage = await env.createEntry('aboutpage', {
            fields: {
              slug: {
                'nl-NL': uniqueSlug
              },
              pageType: {
                'nl-NL': 'Teammemberpage'
              },
              teamMember: {
                'nl-NL': {
                  sys: {
                    type: 'Link',
                    linkType: 'Entry',
                    id: teamMemberId
                  }
                }
              },
              title: {
                'nl-NL': teamMemberName
              }
            }
          });
        }
      } else {
        console.log(`✨ Nieuwe Aboutpage (Teammemberpage) aanmaken met slug: ${slug}`);

        // CRITICAL: Gebruik de volledige slug met /team/ prefix
        const fullSlugForCreation = `/team/${createSlugFromName(teamMemberName)}`;

        // CRITICAL: Haal teamMember entry op om alle data te hebben
        if (!teamMemberEntry) {
          teamMemberEntry = await env.getEntry(teamMemberId);
        }

        // Haal alle beschikbare velden op van teamMember
        const teamMemberFields = teamMemberEntry.fields || {};
        const teamMemberNameFromFields =
          teamMemberFields.name?.['nl-NL'] ||
          teamMemberFields.name?.['nl'] ||
          teamMemberFields.name ||
          teamMemberName;

        console.log(`📝 Aanmaken nieuwe Aboutpage met fields:`);
        console.log(`   slug: ${fullSlugForCreation}`);
        console.log(`   pageType: Teammemberpage`);
        console.log(`   title: ${teamMemberNameFromFields}`);
        console.log(`   teamMember: ${teamMemberId}`);

        teamMemberPage = await env.createEntry('aboutpage', {
          fields: {
            slug: {
              'nl-NL': fullSlugForCreation
            },
            pageType: {
              'nl-NL': 'Teammemberpage'
            },
            teamMember: {
              'nl-NL': {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: teamMemberId
                }
              }
            },
            title: {
              'nl-NL': teamMemberNameFromFields
            }
          }
        });

        isNewPage = true; // CRITICAL: Zet isNewPage expliciet op true
        console.log(`✅ NIEUWE Aboutpage (Teammemberpage) aangemaakt: ${teamMemberPage.sys.id}`);
        console.log(`   Slug: ${fullSlugForCreation}`);
        console.log(`   PageType: Teammemberpage`);
        console.log(`   Title: ${teamMemberNameFromFields}`);
        console.log(`   Team member: ${teamMemberNameFromFields} (${teamMemberId})`);

        // Verifieer dat de fields correct zijn ingesteld DIRECT na creatie
        console.log(`🔍 Verificatie van aangemaakte pagina fields (direct na creatie):`);
        console.log(`   slug: ${teamMemberPage.fields?.slug?.['nl-NL'] || 'MISSING!'}`);
        console.log(`   pageType: ${teamMemberPage.fields?.pageType?.['nl-NL'] || 'MISSING!'}`);
        console.log(`   title: ${teamMemberPage.fields?.title?.['nl-NL'] || 'MISSING!'}`);
        console.log(
          `   teamMember: ${teamMemberPage.fields?.teamMember?.['nl-NL']?.sys?.id || 'MISSING!'}`
        );
      }
    }

    // Log duidelijk of dit een nieuwe of bestaande pagina is
    if (isNewPage) {
      console.log(`🎉 SUCCESS: Nieuwe pagina aangemaakt voor nieuwe team member`);
    } else {
      console.log(`🔄 UPDATE: Bestaande pagina wordt bijgewerkt (geen nieuwe pagina aangemaakt)`);
    }

    // CRITICAL: Definieer fullSlug VOORDAT we het gebruiken
    // Dit moet gebeuren voor zowel nieuwe als bestaande pagina's
    const currentSlug = createSlugFromName(teamMemberName);
    const fullSlug = `/team/${currentSlug}`;
    console.log(`🔗 Full slug voor deze team member: ${fullSlug}`);

    // Voor nieuwe pagina's: haal entry opnieuw op en UPDATE met alle fields
    // CRITICAL: createEntry slaat soms fields niet correct op, dus we moeten direct updaten
    if (isNewPage) {
      try {
        teamMemberPage = await env.getEntry(teamMemberPage.sys.id);
        console.log(`🔄 Nieuwe pagina opgehaald om fields te verifiëren`);

        // CRITICAL: Zorg dat alle fields correct zijn ingesteld na ophalen
        // Soms worden fields niet correct opgeslagen bij createEntry, dus we zetten ze opnieuw
        if (!teamMemberPage.fields) {
          teamMemberPage.fields = {};
        }

        // Forceer slug
        if (!teamMemberPage.fields.slug) {
          teamMemberPage.fields.slug = {};
        }
        teamMemberPage.fields.slug['nl-NL'] = fullSlug;

        // Forceer pageType
        if (!teamMemberPage.fields.pageType) {
          teamMemberPage.fields.pageType = {};
        }
        teamMemberPage.fields.pageType['nl-NL'] = 'Teammemberpage';

        // Forceer title
        if (!teamMemberPage.fields.title) {
          teamMemberPage.fields.title = {};
        }
        teamMemberPage.fields.title['nl-NL'] = teamMemberName;

        // Forceer teamMember link
        if (!teamMemberPage.fields.teamMember) {
          teamMemberPage.fields.teamMember = {};
        }
        teamMemberPage.fields.teamMember['nl-NL'] = {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: teamMemberId
          }
        };

        console.log(`✅ Fields geforceerd ingesteld na ophalen:`);
        console.log(`   slug: ${teamMemberPage.fields.slug['nl-NL']}`);
        console.log(`   pageType: ${teamMemberPage.fields.pageType['nl-NL']}`);
        console.log(`   title: ${teamMemberPage.fields.title['nl-NL']}`);
        console.log(`   teamMember: ${teamMemberPage.fields.teamMember['nl-NL']?.sys?.id}`);

        // CRITICAL: Update de entry DIRECT om de fields op te slaan
        // Contentful slaat fields soms niet correct op bij createEntry, dus we moeten altijd updaten
        console.log(`💾 Updaten nieuwe pagina met geforceerde fields...`);

        try {
          teamMemberPage = await teamMemberPage.update();
          console.log(
            `✅ Nieuwe pagina geüpdatet met fields (version: ${teamMemberPage.sys.version})`
          );

          // CRITICAL: Haal entry opnieuw op na update om zeker te zijn dat fields zijn opgeslagen
          teamMemberPage = await env.getEntry(teamMemberPage.sys.id);

          // Verifieer dat fields zijn opgeslagen
          console.log(`🔍 Verificatie na update (entry opnieuw opgehaald):`);
          console.log(`   slug: ${teamMemberPage.fields?.slug?.['nl-NL'] || 'MISSING!'}`);
          console.log(`   pageType: ${teamMemberPage.fields?.pageType?.['nl-NL'] || 'MISSING!'}`);
          console.log(`   title: ${teamMemberPage.fields?.title?.['nl-NL'] || 'MISSING!'}`);
          console.log(
            `   teamMember: ${teamMemberPage.fields?.teamMember?.['nl-NL']?.sys?.id || 'MISSING!'}`
          );

          // Als fields nog steeds missing zijn, forceer ze opnieuw
          if (
            !teamMemberPage.fields?.slug?.['nl-NL'] ||
            !teamMemberPage.fields?.pageType?.['nl-NL']
          ) {
            console.warn(`⚠️  Fields nog steeds missing na update - forceer opnieuw...`);
            if (!teamMemberPage.fields) teamMemberPage.fields = {};
            if (!teamMemberPage.fields.slug) teamMemberPage.fields.slug = {};
            if (!teamMemberPage.fields.pageType) teamMemberPage.fields.pageType = {};
            if (!teamMemberPage.fields.title) teamMemberPage.fields.title = {};
            if (!teamMemberPage.fields.teamMember) teamMemberPage.fields.teamMember = {};

            teamMemberPage.fields.slug['nl-NL'] = fullSlug;
            teamMemberPage.fields.pageType['nl-NL'] = 'Teammemberpage';
            teamMemberPage.fields.title['nl-NL'] = teamMemberName;
            teamMemberPage.fields.teamMember['nl-NL'] = {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: teamMemberId
              }
            };

            // Update opnieuw
            teamMemberPage = await teamMemberPage.update();
            console.log(`✅ Pagina opnieuw geüpdatet met geforceerde fields`);
          }
        } catch (updateError) {
          console.error(`❌ Kon pagina niet updaten: ${updateError.message}`);
          throw updateError; // Re-throw omdat we een onvolledige pagina hebben
        }
      } catch (refreshError) {
        console.warn(`⚠️  Kon nieuwe pagina niet ophalen/updaten: ${refreshError.message}`);
        console.warn(`   Stack: ${refreshError.stack}`);
        throw refreshError; // Re-throw omdat we een onvolledige pagina hebben
      }
    }

    // SAFETY: Only update if there are actual changes to prevent unnecessary updates
    // Check if update is needed before calling update()
    let needsUpdate = false;

    // Check en update slug - altijd nodig voor nieuwe pagina's
    // Initialize fields object if it doesn't exist
    if (!teamMemberPage.fields) {
      teamMemberPage.fields = {};
    }

    const currentSlugValue = teamMemberPage.fields?.slug?.['nl-NL'];
    if (!currentSlugValue || currentSlugValue !== fullSlug) {
      if (!teamMemberPage.fields.slug) {
        teamMemberPage.fields.slug = {};
      }
      teamMemberPage.fields.slug['nl-NL'] = fullSlug;
      needsUpdate = true;
      console.log(`📝 Slug update nodig: ${fullSlug} (huidige: ${currentSlugValue || 'geen'})`);
    } else {
      console.log(`✓ Slug is al correct: ${fullSlug}`);
    }

    // Check en update title
    const currentTitle = teamMemberPage.fields?.title?.['nl-NL'];
    if (!currentTitle || currentTitle !== teamMemberName) {
      if (!teamMemberPage.fields.title) {
        teamMemberPage.fields.title = {};
      }
      teamMemberPage.fields.title['nl-NL'] = teamMemberName;
      needsUpdate = true;
      console.log(`📝 Title update nodig: ${teamMemberName} (huidige: ${currentTitle || 'geen'})`);
    } else {
      console.log(`✓ Title is al correct: ${teamMemberName}`);
    }

    // Check en update pageType - CRITICAL voor filtering
    const currentPageType = teamMemberPage.fields?.pageType?.['nl-NL'];
    if (!currentPageType || currentPageType !== 'Teammemberpage') {
      if (!teamMemberPage.fields.pageType) {
        teamMemberPage.fields.pageType = {};
      }
      teamMemberPage.fields.pageType['nl-NL'] = 'Teammemberpage';
      needsUpdate = true;
      console.log(
        `📝 PageType update nodig: Teammemberpage (huidige: ${currentPageType || 'geen'})`
      );
    } else {
      console.log(`✓ PageType is al correct: Teammemberpage`);
    }

    // Check if teamMember link needs update
    const currentTeamMemberLink = teamMemberPage.fields?.teamMember?.['nl-NL']?.sys?.id;
    if (currentTeamMemberLink !== teamMemberId) {
      if (!teamMemberPage.fields.teamMember) {
        teamMemberPage.fields.teamMember = {};
      }
      teamMemberPage.fields.teamMember['nl-NL'] = {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: teamMemberId
        }
      };
      needsUpdate = true;
      console.log(
        `📝 TeamMember link update nodig: ${teamMemberId} (huidige: ${currentTeamMemberLink || 'geen'})`
      );
    } else {
      console.log(`✓ TeamMember link is al correct: ${teamMemberId}`);
    }

    // Update entry als er wijzigingen zijn
    // Voor nieuwe pagina's: skip update hier omdat we dat al hebben gedaan na ophalen
    // Voor bestaande pagina's: update alleen als er wijzigingen zijn
    if (needsUpdate && !isNewPage) {
      console.log(`💾 Updaten Aboutpage (changes detected)...`);

      try {
        teamMemberPage = await teamMemberPage.update();
        console.log(`✅ Aboutpage geüpdatet (version: ${teamMemberPage.sys.version})`);

        // Verifieer na update
        console.log(`🔍 Verificatie na update:`);
        console.log(`   slug: ${teamMemberPage.fields?.slug?.['nl-NL'] || 'MISSING!'}`);
        console.log(`   pageType: ${teamMemberPage.fields?.pageType?.['nl-NL'] || 'MISSING!'}`);
        console.log(`   title: ${teamMemberPage.fields?.title?.['nl-NL'] || 'MISSING!'}`);
        console.log(
          `   teamMember: ${teamMemberPage.fields?.teamMember?.['nl-NL']?.sys?.id || 'MISSING!'}`
        );
      } catch (updateError) {
        console.error(`❌ Kon Aboutpage niet updaten: ${updateError.message}`);
        console.error(`   Stack: ${updateError.stack}`);
        throw updateError; // Re-throw om te voorkomen dat we een onvolledige pagina publiceren
      }
    } else if (isNewPage) {
      // Voor nieuwe pagina's hebben we al geüpdatet na ophalen
      console.log(`ℹ️  Nieuwe pagina is al geüpdatet na ophalen - skip extra update`);
    } else {
      console.log(`ℹ️  Geen updates nodig voor Aboutpage - alles is al correct`);
    }

    // CRITICAL: Publish nieuwe pagina's altijd, bestaande pagina's altijd als er wijzigingen zijn
    // Dit zorgt ervoor dat de fields (slug, pageType) zichtbaar zijn in Contentful UI
    // BELANGRIJK: Voor nieuwe pagina's moeten we ALTIJD publiceren, ook als needsUpdate false is
    // omdat de fields mogelijk niet correct zijn ingesteld bij createEntry
    const wasAlreadyPublished = teamMemberPage.isPublished();
    const shouldPublish = !wasAlreadyPublished || needsUpdate || isNewPage;

    if (shouldPublish) {
      // Nieuwe pagina's en updates moeten altijd gepubliceerd worden
      try {
        // Haal entry opnieuw op om zeker te zijn dat we de laatste versie hebben
        teamMemberPage = await env.getEntry(teamMemberPage.sys.id);

        // CRITICAL: Voor nieuwe pagina's moeten we ALTIJD fields forceren voordat we publiceren
        // Dit is belangrijk omdat Contentful soms fields niet correct opslaat bij createEntry
        // Voor bestaande pagina's: alleen als er wijzigingen zijn
        if (isNewPage || needsUpdate) {
          // Haal entry opnieuw op om zeker te zijn dat we de laatste versie hebben
          teamMemberPage = await env.getEntry(teamMemberPage.sys.id);

          if (!teamMemberPage.fields) {
            teamMemberPage.fields = {};
          }

          // Forceer slug
          if (!teamMemberPage.fields.slug) {
            teamMemberPage.fields.slug = {};
          }
          teamMemberPage.fields.slug['nl-NL'] = fullSlug;

          // Forceer pageType
          if (!teamMemberPage.fields.pageType) {
            teamMemberPage.fields.pageType = {};
          }
          teamMemberPage.fields.pageType['nl-NL'] = 'Teammemberpage';

          // Forceer title
          if (!teamMemberPage.fields.title) {
            teamMemberPage.fields.title = {};
          }
          teamMemberPage.fields.title['nl-NL'] = teamMemberName;

          // Forceer teamMember link
          if (!teamMemberPage.fields.teamMember) {
            teamMemberPage.fields.teamMember = {};
          }
          teamMemberPage.fields.teamMember['nl-NL'] = {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: teamMemberId
            }
          };

          // Update entry met geforceerde fields
          console.log(`💾 Updaten entry met geforceerde fields voor publicatie...`);
          console.log(`   Fields voor update:`);
          console.log(`     slug: ${teamMemberPage.fields.slug['nl-NL']}`);
          console.log(`     pageType: ${teamMemberPage.fields.pageType['nl-NL']}`);
          console.log(`     title: ${teamMemberPage.fields.title['nl-NL']}`);
          teamMemberPage = await teamMemberPage.update();
          console.log(
            `✅ Entry geüpdatet met geforceerde fields (version: ${teamMemberPage.sys.version})`
          );

          // Verifieer dat fields zijn opgeslagen
          console.log(`🔍 Verificatie na update (voor publicatie):`);
          console.log(`   slug: ${teamMemberPage.fields?.slug?.['nl-NL'] || 'MISSING!'}`);
          console.log(`   pageType: ${teamMemberPage.fields?.pageType?.['nl-NL'] || 'MISSING!'}`);
          console.log(`   title: ${teamMemberPage.fields?.title?.['nl-NL'] || 'MISSING!'}`);
        }

        // Unpublish first als nodig (voor republish)
        if (wasAlreadyPublished) {
          try {
            await teamMemberPage.unpublish();
            console.log(`📤 Aboutpage ungepubliceerd voor republish`);
            // Haal opnieuw op na unpublish
            teamMemberPage = await env.getEntry(teamMemberPage.sys.id);
          } catch (unpublishError) {
            // Ignore if already unpublished or other errors
            console.log(`ℹ️  Unpublish niet nodig of gefaald: ${unpublishError.message}`);
          }
        }

        teamMemberPage = await teamMemberPage.publish();
        console.log(`📢 Teammemberpage gepubliceerd: ${teamMemberPage.sys.id}`);
        console.log(`   Published version: ${teamMemberPage.sys.publishedVersion || 'N/A'}`);

        // Verifieer gepubliceerde fields door entry opnieuw op te halen
        const finalPage = await env.getEntry(teamMemberPage.sys.id);
        console.log(`🔍 Verificatie gepubliceerde pagina (entry opnieuw opgehaald):`);
        console.log(`   slug: ${finalPage.fields?.slug?.['nl-NL'] || 'MISSING!'}`);
        console.log(`   pageType: ${finalPage.fields?.pageType?.['nl-NL'] || 'MISSING!'}`);
        console.log(`   title: ${finalPage.fields?.title?.['nl-NL'] || 'MISSING!'}`);
        console.log(
          `   teamMember: ${finalPage.fields?.teamMember?.['nl-NL']?.sys?.id || 'MISSING!'}`
        );
        console.log(`   Is gepubliceerd: ${finalPage.isPublished() ? '✅ JA' : '❌ NEE'}`);

        if (!finalPage.fields?.slug?.['nl-NL'] || !finalPage.fields?.pageType?.['nl-NL']) {
          console.error(`❌ CRITICAL: Slug of pageType is nog steeds MISSING na publicatie!`);
          console.error(
            `   Dit kan betekenen dat de fields niet correct zijn ingesteld in Contentful`
          );
        }
      } catch (publishError) {
        console.error(`❌ Kon teammemberpage niet publiceren: ${publishError.message}`);
        console.error(`   Stack: ${publishError.stack}`);
        // Don't fail - maar log het wel zodat we kunnen debuggen
      }
    } else {
      console.log(
        `ℹ️  Teammemberpage is al gepubliceerd: ${teamMemberPage.sys.id} - geen republish nodig`
      );
    }

    // Update TeamMember entry om link naar Aboutpage te zetten
    // SAFETY: Only update if the link is actually different to prevent unnecessary updates
    try {
      const teamMemberEntry = await env.getEntry(teamMemberId);
      const currentLink = teamMemberEntry.fields?.link || {};
      const localeKeys = Object.keys(currentLink);
      const localesToUpdate = localeKeys.length > 0 ? localeKeys : ['nl-NL'];

      let linkUpdated = false;
      for (const locale of localesToUpdate) {
        const currentLinkId = currentLink[locale]?.sys?.id;
        if (currentLinkId !== teamMemberPage.sys.id) {
          currentLink[locale] = {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: teamMemberPage.sys.id
            }
          };
          linkUpdated = true;
          console.log(
            `🔗 Link naar Aboutpage gezet in TeamMember (${locale}): ${teamMemberPage.sys.id}`
          );
        } else {
          console.log(`ℹ️  Link in TeamMember is al correct (${locale}): ${currentLinkId}`);
        }
      }

      // CRITICAL: Only update and publish if link actually changed
      // BELANGRIJK: We publiceren NIET opnieuw de teamMember entry om loops te voorkomen!
      // De link wordt opgeslagen maar niet gepubliceerd. Bij de volgende handmatige publish
      // van de teamMember wordt de link automatisch gepubliceerd.
      if (linkUpdated) {
        console.log(`💾 Updaten TeamMember entry met nieuwe link...`);
        teamMemberEntry.fields.link = currentLink;
        const updatedTeamMember = await teamMemberEntry.update();
        console.log(`✅ TeamMember entry geüpdatet (version: ${updatedTeamMember.sys.version})`);
        console.log(`   ⚠️  Link wordt NIET opnieuw gepubliceerd om webhook loop te voorkomen`);
        console.log(
          `   💡 Link is opgeslagen en wordt gepubliceerd bij volgende handmatige publish van team member`
        );
      } else {
        console.log(`ℹ️  Link in TeamMember is al correct - geen update nodig`);
      }
    } catch (linkError) {
      console.warn(`⚠️  Kon link niet updaten in TeamMember entry: ${linkError.message}`);
      // Don't fail if link update fails
    }

    // Voeg team member automatisch toe aan TeamOverview collections
    // Specifieke TeamOverview entry ID (als environment variable is ingesteld)
    const TEAM_OVERVIEW_ENTRY_ID = process.env.TEAM_OVERVIEW_ENTRY_ID || '13d7Cj8GPxuvEb7YSosmHH';

    try {
      // Probeer eerst de specifieke entry op te halen
      let targetOverview = null;
      try {
        console.log(`🔍 Ophalen entry ${TEAM_OVERVIEW_ENTRY_ID}...`);
        targetOverview = await env.getEntry(TEAM_OVERVIEW_ENTRY_ID);
        console.log(
          `✅ Entry opgehaald: ${targetOverview.sys.id}, content type: ${targetOverview.sys.contentType.sys.id}`
        );

        const overviewType =
          targetOverview.fields?.overviewType?.['nl-NL'] ||
          targetOverview.fields?.overviewType?.['nl'] ||
          targetOverview.fields?.overviewType ||
          'unknown';

        console.log(`📋 overviewType gevonden: "${overviewType}"`);

        if (overviewType === 'TeamOverview') {
          console.log(`✅ Specifieke TeamOverview entry gevonden: ${TEAM_OVERVIEW_ENTRY_ID}`);
        } else {
          console.warn(
            `⚠️  Entry ${TEAM_OVERVIEW_ENTRY_ID} heeft overviewType "${overviewType}", verwacht "TeamOverview"`
          );
          console.log(`💡 Entry wordt toch gebruikt (overviewType check wordt overgeslagen)`);
          // Gebruik de entry toch, ook al is overviewType niet precies 'TeamOverview'
          // Dit kan voorkomen als er een typo is of als de waarde anders is geformatteerd
        }
      } catch (entryError) {
        console.error(
          `❌ Kon specifieke entry ${TEAM_OVERVIEW_ENTRY_ID} niet vinden:`,
          entryError.message
        );
        console.error(`   Stack:`, entryError.stack);
        targetOverview = null;
      }

      // Fallback: zoek alle SpecialisationHomeOverview entries met overviewType 'TeamOverview'
      let filteredOverviews = [];
      if (!targetOverview) {
        console.log(`🔍 Zoeken naar alle TeamOverview entries...`);
        let teamOverviewEntries = await env
          .getEntries({
            content_type: 'specialisationHomeOverview',
            limit: 100
          })
          .catch((err) => {
            console.error(`❌ Error bij ophalen entries:`, err.message);
            return { items: [] };
          });

        // Filter on client side because Contentful filters might not work for all fields
        filteredOverviews = teamOverviewEntries.items.filter((entry) => {
          const overviewType =
            entry.fields?.overviewType?.['nl-NL'] ||
            entry.fields?.overviewType?.['nl'] ||
            entry.fields?.overviewType;
          return overviewType === 'TeamOverview';
        });

        console.log(
          `🔍 ${teamOverviewEntries.items.length} SpecialisationHomeOverview entries gevonden`
        );
        console.log(`✅ ${filteredOverviews.length} TeamOverview entries gevonden (gefilterd)`);
      } else {
        // Gebruik de specifieke entry (ook als overviewType niet precies matcht)
        filteredOverviews = [targetOverview];
        console.log(`✅ Gebruik specifieke entry: ${targetOverview.sys.id}`);
      }

      if (filteredOverviews.length === 0) {
        console.error(
          '❌ Geen TeamOverview entries gevonden - team member wordt NIET toegevoegd aan collectie'
        );
        console.log(
          '💡 Tip: Check of er een SpecialisationHomeOverview entry bestaat met overviewType = "TeamOverview"'
        );
        console.log(
          `💡 Tip: Of stel TEAM_OVERVIEW_ENTRY_ID environment variable in met de entry ID`
        );
        console.log(`💡 Tip: Entry ID die wordt gebruikt: ${TEAM_OVERVIEW_ENTRY_ID}`);
      } else {
        console.log(`✅ ${filteredOverviews.length} entry/entries gevonden om te updaten`);
      }

      for (const overview of filteredOverviews) {
        try {
          // Haal entry opnieuw op om latest version te krijgen (voor updates)
          const freshOverview = await env.getEntry(overview.sys.id);

          // Debug: log alle beschikbare fields
          const allFields = Object.keys(freshOverview.fields || {});
          console.log(
            `🔍 Fields beschikbaar op SpecialisationHomeOverview ${freshOverview.sys.id}:`,
            allFields
          );

          // Check of team member al in de collectie zit
          // BELANGRIJK: Het veld heet 'teamMember' (niet 'teamMemberCollection' in Management API)
          // GraphQL gebruikt 'teamMemberCollection' maar Management API gebruikt 'teamMember'
          const teamMemberField = freshOverview.fields?.teamMember;
          const teamMemberCollectionField = freshOverview.fields?.teamMemberCollection;
          const teamMembersField = freshOverview.fields?.teamMembers;

          console.log(
            `📦 teamMember veld gevonden:`,
            !!teamMemberField,
            teamMemberField ? `(type: ${typeof teamMemberField})` : ''
          );
          console.log(
            `📦 teamMemberCollection veld gevonden:`,
            !!teamMemberCollectionField,
            teamMemberCollectionField ? `(type: ${typeof teamMemberCollectionField})` : ''
          );
          console.log(
            `📦 teamMembers veld gevonden:`,
            !!teamMembersField,
            teamMembersField ? `(type: ${typeof teamMembersField})` : ''
          );

          // Gebruik teamMember eerst (dit is de Management API naam)
          // teamMemberCollection wordt alleen gebruikt in GraphQL queries
          const currentMembers =
            teamMemberField || teamMemberCollectionField || teamMembersField || {};

          if (!teamMemberField && !teamMemberCollectionField && !teamMembersField) {
            console.error(`❌ GEEN team member collection veld gevonden!`);
            console.error(
              `   Mogelijke veld namen in Contentful:`,
              allFields.filter((f) => f.toLowerCase().includes('team'))
            );
            throw new Error(`teamMember veld bestaat niet op deze entry`);
          }

          // Log welke veld naam wordt gebruikt
          if (teamMemberField) {
            console.log(`✅ Gebruik 'teamMember' veld (Management API naam)`);
          } else if (teamMemberCollectionField) {
            console.log(`✅ Gebruik 'teamMemberCollection' veld (GraphQL naam)`);
          } else if (teamMembersField) {
            console.log(`✅ Gebruik 'teamMembers' veld (alternatieve naam)`);
          }

          const localeKeys = Object.keys(currentMembers);

          // Als er geen locales zijn, probeer dan standaard locale
          const localesToProcess = localeKeys.length > 0 ? localeKeys : ['nl-NL'];

          let needsUpdate = false;
          const updatedMembers = {};

          console.log(
            `📋 Verwerken TeamOverview ${freshOverview.sys.id}, locales: ${localesToProcess.join(', ')}`
          );

          for (const locale of localesToProcess) {
            const existingMembers = currentMembers[locale] || [];

            // Handle both array of objects and array of links
            const memberIds = existingMembers
              .map((m) => {
                if (typeof m === 'object') {
                  return m?.sys?.id || m?.id;
                }
                return null;
              })
              .filter(Boolean);

            console.log(
              `  Locale ${locale}: ${memberIds.length} bestaande members, zoekt ID: ${teamMemberId}`
            );

            // Check of team member al in de collectie zit
            if (!memberIds.includes(teamMemberId)) {
              // Voeg team member toe aan collectie
              updatedMembers[locale] = [
                ...existingMembers,
                {
                  sys: {
                    type: 'Link',
                    linkType: 'Entry',
                    id: teamMemberId
                  }
                }
              ];
              needsUpdate = true;
              console.log(`  ✅ Team member toegevoegd aan collectie (${locale})`);
            } else {
              // Blijf bestaande members behouden
              updatedMembers[locale] = existingMembers;
              console.log(`  ℹ️  Team member zat al in collectie (${locale})`);
            }
          }

          // Update alleen als er iets is veranderd
          if (needsUpdate) {
            console.log(`💾 Updaten TeamOverview ${freshOverview.sys.id}...`);

            // BELANGRIJK: Probeer beide veld namen - teamMemberCollection (GraphQL naam) en teamMember (Management API naam)
            // In GraphQL queries heet het 'teamMemberCollection', maar in Management API kan het 'teamMember' heten
            // We proberen eerst teamMemberCollection, en als dat niet werkt, gebruiken we teamMember

            let fieldUpdated = false;

            // Probeer eerst teamMemberCollection (GraphQL naam)
            if (freshOverview.fields.teamMemberCollection !== undefined) {
              freshOverview.fields.teamMemberCollection = updatedMembers;
              console.log(`✅ Gebruik 'teamMemberCollection' veld voor update (GraphQL naam)`);
              fieldUpdated = true;
            }
            // Probeer ook teamMember (Management API naam) - dit is waarschijnlijk hetzelfde veld
            // In Contentful kunnen beide namen werken, afhankelijk van hoe het content type is geconfigureerd
            if (freshOverview.fields.teamMember !== undefined && !fieldUpdated) {
              freshOverview.fields.teamMember = updatedMembers;
              console.log(`✅ Gebruik 'teamMember' veld voor update (Management API naam)`);
              fieldUpdated = true;
            } else if (freshOverview.fields.teamMember !== undefined && fieldUpdated) {
              // Als teamMemberCollection bestaat, update ook teamMember (als het een ander veld is)
              // Dit kan nodig zijn als beide velden bestaan en beide moeten worden geüpdatet
              freshOverview.fields.teamMember = updatedMembers;
              console.log(`✅ Gebruik ook 'teamMember' veld voor update (beide velden geüpdatet)`);
            }

            if (!fieldUpdated) {
              // Als laatste redmiddel, probeer teamMember
              freshOverview.fields.teamMember = updatedMembers;
              console.log(
                `⚠️  Geen teamMember/teamMemberCollection veld gevonden, probeert 'teamMember' te gebruiken...`
              );
            }

            // Log de velden die we gaan updaten voor debugging
            console.log(`🔍 Fields die worden geüpdatet:`);
            console.log(`   teamMember: ${freshOverview.fields.teamMember ? '✅' : '❌'}`);
            console.log(`   Locales: ${Object.keys(updatedMembers || {}).join(', ')}`);
            console.log(`   Aantal members per locale:`);
            Object.keys(updatedMembers || {}).forEach((locale) => {
              const members = updatedMembers[locale] || [];
              console.log(`     ${locale}: ${members.length} members`);
            });

            const updatedOverview = await freshOverview.update();
            console.log(`  ✅ TeamOverview geüpdatet (version: ${updatedOverview.sys.version})`);
            console.log(
              `   Is gepubliceerd: ${updatedOverview.isPublished() ? '✅ JA' : '❌ NEE'}`
            );

            // Publish de updated overview - ALTIJD republiseren als er wijzigingen zijn
            // Dit zorgt ervoor dat de team member zichtbaar is op de homepage en team pagina
            let publishedOverview = null;
            try {
              // CRITICAL: Haal entry opnieuw op om zeker te zijn dat we de laatste versie hebben
              const freshUpdatedOverview = await env.getEntry(updatedOverview.sys.id);
              console.log(
                `  🔄 Entry opnieuw opgehaald voor publish (version: ${freshUpdatedOverview.sys.version})`
              );
              console.log(
                `   Is al gepubliceerd: ${freshUpdatedOverview.isPublished() ? '✅ JA' : '❌ NEE'}`
              );

              // Unpublish first if needed, then publish (for republish)
              if (freshUpdatedOverview.isPublished()) {
                try {
                  console.log(`  📤 Unpublishen TeamOverview voor republish...`);
                  await freshUpdatedOverview.unpublish();
                  console.log(`  ✅ TeamOverview ungepubliceerd`);

                  // Haal opnieuw op na unpublish om laatste versie te krijgen
                  const unpublishedOverview = await env.getEntry(freshUpdatedOverview.sys.id);
                  console.log(
                    `  🔄 Entry opgehaald na unpublish (version: ${unpublishedOverview.sys.version})`
                  );

                  // Publiceer nu
                  publishedOverview = await unpublishedOverview.publish();
                  console.log(
                    `📢 TeamOverview ${publishedOverview.sys.id} gerepubliceerd met nieuwe team member`
                  );
                  console.log(
                    `   Published version: ${publishedOverview.sys.publishedVersion || 'N/A'}`
                  );
                } catch (unpublishError) {
                  // Als unpublish faalt, probeer direct te publiceren (misschien is het al unpublished)
                  console.log(`  ⚠️  Unpublish gefaald: ${unpublishError.message}`);
                  console.log(`  📢 Probeer direct te publiceren...`);
                  try {
                    publishedOverview = await freshUpdatedOverview.publish();
                    console.log(
                      `📢 TeamOverview ${publishedOverview.sys.id} gepubliceerd met nieuwe team member`
                    );
                    console.log(
                      `   Published version: ${publishedOverview.sys.publishedVersion || 'N/A'}`
                    );
                  } catch (directPublishError) {
                    console.error(`❌ Direct publish ook gefaald: ${directPublishError.message}`);
                    throw directPublishError;
                  }
                }
              } else {
                // Niet gepubliceerd, publiceer direct
                console.log(`  📢 TeamOverview is niet gepubliceerd, publiceer nu...`);
                publishedOverview = await freshUpdatedOverview.publish();
                console.log(
                  `📢 TeamOverview ${publishedOverview.sys.id} gepubliceerd met nieuwe team member`
                );
                console.log(
                  `   Published version: ${publishedOverview.sys.publishedVersion || 'N/A'}`
                );
              }

              // Verifieer dat team member in collectie zit
              // Haal entry opnieuw op om de gepubliceerde versie te krijgen
              if (publishedOverview) {
                const finalPublishedOverview = await env.getEntry(publishedOverview.sys.id);
                console.log(`  🔄 Finale verificatie van gepubliceerde entry...`);
                console.log(
                  `   Is gepubliceerd: ${finalPublishedOverview.isPublished() ? '✅ JA' : '❌ NEE'}`
                );

                // Check beide veld namen: teamMemberCollection (GraphQL) en teamMember (Management API)
                const publishedMembers =
                  finalPublishedOverview.fields?.teamMemberCollection?.['nl-NL'] ||
                  finalPublishedOverview.fields?.teamMemberCollection?.['en-US'] ||
                  finalPublishedOverview.fields?.teamMember?.['nl-NL'] ||
                  finalPublishedOverview.fields?.teamMember?.['en-US'] ||
                  finalPublishedOverview.fields?.teamMembers?.['nl-NL'] ||
                  [];
                const publishedMemberIds = publishedMembers
                  .map((m) => m?.sys?.id || m?.id)
                  .filter(Boolean);
                console.log(`   Team members in collectie: ${publishedMemberIds.length}`);
                console.log(
                  `   Nieuwe team member in collectie: ${publishedMemberIds.includes(teamMemberId) ? '✅ JA' : '❌ NEE'}`
                );
                if (!publishedMemberIds.includes(teamMemberId)) {
                  console.error(`❌ Team member ${teamMemberId} is NIET toegevoegd aan collectie!`);
                  console.error(`   Published member IDs: ${publishedMemberIds.join(', ')}`);
                  console.error(`   Zoekt ID: ${teamMemberId}`);
                  console.error(
                    `   Check teamMemberCollection: ${finalPublishedOverview.fields?.teamMemberCollection ? '✅ bestaat' : '❌ bestaat niet'}`
                  );
                  console.error(
                    `   Check teamMember: ${finalPublishedOverview.fields?.teamMember ? '✅ bestaat' : '❌ bestaat niet'}`
                  );
                }
              } else {
                console.error(`❌ Published overview is null - publicatie is gefaald`);
              }
            } catch (publishError) {
              console.error(`❌ Kon TeamOverview niet publiceren: ${publishError.message}`);
              console.error(`   Stack: ${publishError.stack}`);
              // Don't fail - maar log het wel
            }
          } else {
            console.log(`ℹ️  Geen update nodig voor TeamOverview ${freshOverview.sys.id}`);
          }
        } catch (overviewError) {
          console.error(
            `❌ Error bij updaten TeamOverview ${overview?.sys?.id || 'unknown'}:`,
            overviewError.message
          );
          console.error('   Stack:', overviewError.stack);
          // Continue met volgende overview
        }
      }
    } catch (collectionError) {
      console.error('❌ Error bij ophalen TeamOverview entries:', collectionError.message);
      // Don't fail the entire webhook if collection update fails
    }

    return res.status(200).json({
      success: true,
      message: 'Team member page created/updated successfully',
      teamMemberPageId: teamMemberPage.sys.id,
      slug: fullSlug,
      teamMemberId: teamMemberId,
      teamMemberName: teamMemberName
    });
  } catch (error) {
    console.error('❌ Error in team member webhook:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
