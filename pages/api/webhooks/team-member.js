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
    if (topic.includes('Entry.publish') && sys?.revision && sys.revision > 1) {
      console.log(
        `ℹ️  Entry heeft revision ${sys.revision} - dit is waarschijnlijk een update, niet een create`
      );
      // We process it anyway, but log it for debugging
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

    // Check wanneer de team member entry is aangemaakt (om te bepalen of het een nieuwe entry is)
    let teamMemberCreatedAt = null;
    try {
      const teamMemberEntry = await env.getEntry(teamMemberId);
      teamMemberCreatedAt = teamMemberEntry.sys.createdAt;
      console.log(`📅 Team member entry created at: ${teamMemberCreatedAt}`);
    } catch (err) {
      console.warn(`⚠️  Kon team member entry niet ophalen voor createdAt check: ${err.message}`);
    }

    const existingPages = await env.getEntries({
      content_type: 'aboutpage',
      'fields.pageType': 'Teammemberpage',
      'fields.teamMember.sys.id': teamMemberId,
      limit: 10 // Haal meer op om te checken of er duplicates zijn
    });

    console.log(
      `📊 ${existingPages.items.length} bestaande Aboutpage(s) gevonden voor deze team member`
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
      console.log(`✅ Bestaande Aboutpage (Teammemberpage) gevonden: ${teamMemberPage.sys.id}`);
      console.log(`   Created: ${teamMemberPage.sys.createdAt}`);
      console.log(`   Slug: ${teamMemberPage.fields?.slug?.['nl-NL'] || 'N/A'}`);
      console.log(`   ⚠️  GEEN nieuwe pagina aangemaakt - bestaande pagina wordt geüpdatet`);

      // SAFETY: Als er duplicates zijn, log maar gebruik de nieuwste
      if (existingPages.items.length > 1) {
        console.warn(
          `⚠️  Meerdere pages gevonden - gebruik de nieuwste (${teamMemberPage.sys.id})`
        );
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

        teamMemberPage = await env.createEntry('aboutpage', {
          fields: {
            slug: {
              'nl-NL': slug
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

        console.log(`✅ NIEUWE Aboutpage (Teammemberpage) aangemaakt: ${teamMemberPage.sys.id}`);
        console.log(`   Slug: ${slug}`);
        console.log(`   Team member: ${teamMemberName} (${teamMemberId})`);
      }
    }

    // Log duidelijk of dit een nieuwe of bestaande pagina is
    if (isNewPage) {
      console.log(`🎉 SUCCESS: Nieuwe pagina aangemaakt voor nieuwe team member`);
    } else {
      console.log(`🔄 UPDATE: Bestaande pagina wordt bijgewerkt (geen nieuwe pagina aangemaakt)`);
    }

    // Voor nieuwe pagina's: haal entry opnieuw op om zeker te zijn dat fields beschikbaar zijn
    if (isNewPage) {
      try {
        teamMemberPage = await env.getEntry(teamMemberPage.sys.id);
        console.log(`🔄 Nieuwe pagina opgehaald om fields te verifiëren`);
      } catch (refreshError) {
        console.warn(`⚠️  Kon nieuwe pagina niet ophalen: ${refreshError.message}`);
      }
    }

    // SAFETY: Only update if there are actual changes to prevent unnecessary updates
    // Check if update is needed before calling update()
    let needsUpdate = false;

    const currentSlug = createSlugFromName(teamMemberName);
    const fullSlug = `/team/${currentSlug}`;

    // Check en update slug - altijd nodig voor nieuwe pagina's
    const currentSlugValue = teamMemberPage.fields?.slug?.['nl-NL'];
    if (!currentSlugValue || currentSlugValue !== fullSlug) {
      if (!teamMemberPage.fields.slug) {
        teamMemberPage.fields.slug = {};
      }
      teamMemberPage.fields.slug['nl-NL'] = fullSlug;
      needsUpdate = true;
      console.log(`📝 Slug update nodig: ${fullSlug} (huidige: ${currentSlugValue || 'geen'})`);
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
    }

    // Check en update pageType
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
    }

    // Update entry als er wijzigingen zijn
    if (needsUpdate) {
      console.log(`💾 Updaten Aboutpage (changes detected)...`);
      teamMemberPage = await teamMemberPage.update();
      console.log(`✅ Aboutpage geüpdatet`);
    } else if (isNewPage) {
      // Voor nieuwe pagina's: update altijd (om zeker te zijn dat alles correct is)
      console.log(`💾 Updaten nieuwe Aboutpage (zonder wijzigingen, maar voor zekerheid)...`);
      teamMemberPage = await teamMemberPage.update();
      console.log(`✅ Nieuwe Aboutpage geüpdatet`);
    } else {
      console.log(`ℹ️  Geen updates nodig voor Aboutpage - alles is al correct`);
    }

    // CRITICAL: Publish nieuwe pagina's altijd, bestaande pagina's alleen als er wijzigingen zijn
    const wasAlreadyPublished = teamMemberPage.isPublished();

    if (!wasAlreadyPublished) {
      // Nieuwe pagina's moeten altijd gepubliceerd worden
      try {
        teamMemberPage = await teamMemberPage.publish();
        console.log(`📢 Teammemberpage gepubliceerd: ${teamMemberPage.sys.id}`);
      } catch (publishError) {
        console.error(`⚠️  Kon teammemberpage niet publiceren: ${publishError.message}`);
        console.error(`   Stack: ${publishError.stack}`);
        // Don't fail - maar log het wel
      }
    } else if (needsUpdate) {
      // Bestaande pagina's: alleen republiseren als er wijzigingen zijn
      try {
        // Unpublish first, then publish to avoid version conflicts
        try {
          await teamMemberPage.unpublish();
        } catch {
          // Ignore if already unpublished
        }
        teamMemberPage = await teamMemberPage.publish();
        console.log(`📢 Teammemberpage gerepubliceerd na update: ${teamMemberPage.sys.id}`);
      } catch (publishError) {
        console.error(`⚠️  Kon teammemberpage niet republiseren: ${publishError.message}`);
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
      // This prevents triggering the webhook unnecessarily
      if (linkUpdated) {
        console.log(`💾 Updaten TeamMember entry met nieuwe link...`);
        teamMemberEntry.fields.link = currentLink;
        const updatedTeamMember = await teamMemberEntry.update();

        // ALWAYS publish if the team member is already published (which it should be, since webhook triggered on publish)
        // This ensures the link is available immediately
        const wasAlreadyPublished = updatedTeamMember.isPublished();

        if (wasAlreadyPublished) {
          try {
            // Unpublish first, then publish to avoid version conflicts
            try {
              await updatedTeamMember.unpublish();
              console.log(`📤 TeamMember entry ungepubliceerd voor republish`);
            } catch (unpublishError) {
              // Ignore if already unpublished or other errors
              console.log(`ℹ️  Unpublish niet nodig of gefaald: ${unpublishError.message}`);
            }
            await updatedTeamMember.publish();
            console.log(`📢 TeamMember entry geüpdatet en gepubliceerd met link naar Aboutpage`);
          } catch (publishError) {
            console.warn(`⚠️  Kon TeamMember entry niet publiceren: ${publishError.message}`);
            console.warn(`   Stack: ${publishError.stack}`);
            // Don't fail - the link update is already saved, just not published yet
            console.log(
              `💡 Link is opgeslagen maar niet gepubliceerd - wordt gepubliceerd bij volgende publish van team member`
            );
          }
        } else {
          // Team member is niet gepubliceerd - dit zou niet moeten gebeuren als webhook op publish triggerde
          console.log(
            `⚠️  TeamMember entry is niet gepubliceerd - link is opgeslagen maar niet gepubliceerd`
          );
          console.log(
            `💡 Link wordt automatisch gepubliceerd wanneer team member wordt gepubliceerd`
          );
        }
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
          // Probeer verschillende mogelijke veld namen
          const teamMemberCollectionField = freshOverview.fields?.teamMemberCollection;
          const teamMembersField = freshOverview.fields?.teamMembers;
          const teamMemberField = freshOverview.fields?.teamMember;

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
          console.log(
            `📦 teamMember veld gevonden:`,
            !!teamMemberField,
            teamMemberField ? `(type: ${typeof teamMemberField})` : ''
          );

          const currentMembers =
            teamMemberCollectionField || teamMembersField || teamMemberField || {};

          if (!teamMemberCollectionField && !teamMembersField && !teamMemberField) {
            console.error(`❌ GEEN team member collection veld gevonden!`);
            console.error(
              `   Mogelijke veld namen in Contentful:`,
              allFields.filter((f) => f.toLowerCase().includes('team'))
            );
            throw new Error(`teamMemberCollection veld bestaat niet op deze entry`);
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

            // Gebruik het veld dat bestaat (teamMemberCollection is de GraphQL naam)
            // In Contentful Management API is dit meestal hetzelfde, maar check eerst
            if (freshOverview.fields.teamMemberCollection !== undefined) {
              freshOverview.fields.teamMemberCollection = updatedMembers;
            } else if (freshOverview.fields.teamMembers !== undefined) {
              freshOverview.fields.teamMembers = updatedMembers;
            } else {
              // Als veld niet bestaat, probeer teamMemberCollection aan te maken
              freshOverview.fields.teamMemberCollection = updatedMembers;
              console.log(`⚠️  teamMemberCollection veld niet gevonden, probeert te creëren...`);
            }

            const updatedOverview = await freshOverview.update();
            console.log(`  ✅ TeamOverview geüpdatet (version: ${updatedOverview.sys.version})`);

            // Publish de updated overview
            if (updatedOverview.isPublished()) {
              // Unpublish first if needed, then publish (for republish)
              try {
                await updatedOverview.unpublish();
              } catch {
                // Ignore if not published
              }
            }

            const publishedOverview = await updatedOverview.publish();
            console.log(
              `📢 TeamOverview ${publishedOverview.sys.id} gepubliceerd met nieuwe team member`
            );
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
