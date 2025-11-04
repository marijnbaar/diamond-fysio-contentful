import { createClient } from 'contentful-management';

const SPACE_ID = process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CTF_ENV_ID || process.env.ENV_ID || 'master';
const MGMT_TOKEN = process.env.CTF_MANAGEMENT_TOKEN || process.env.CMAACCESSTOKEN;
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
  const authHeader = req.headers.authorization || req.headers['x-contentful-webhook-secret'];

  // If WEBHOOK_SECRET is set and authorization header is present, verify it
  if (WEBHOOK_SECRET && authHeader) {
    const isValid = authHeader === `Bearer ${WEBHOOK_SECRET}` || authHeader === WEBHOOK_SECRET;
    if (isValid) {
      return true;
    }
    // If secret doesn't match, reject
    console.error('❌ Authorization header does not match WEBHOOK_SECRET');
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

  // Verify webhook
  if (!verifyWebhook(req)) {
    console.error('❌ Webhook verificatie gefaald');
    return res.status(401).json({ error: 'Unauthorized' });
  }

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

    if (!contentTypeId || normalizedContentTypeId !== expectedContentTypeId) {
      console.log(
        `ℹ️  Webhook ontvangen voor content type "${contentTypeId}" (normalized: "${normalizedContentTypeId}"), verwacht "teamMember" - overslaan`
      );
      return res.status(200).json({
        message: 'Not a team member entry, skipping',
        receivedContentType: contentTypeId,
        normalizedContentType: normalizedContentTypeId,
        sysId: sys?.id,
        fullSys: sys
      });
    }

    // Check of dit een create/publish event is
    const topic = req.headers['x-contentful-topic'];
    if (!topic || (!topic.includes('Entry.publish') && !topic.includes('Entry.create'))) {
      console.log(
        `ℹ️  Webhook event: ${topic} - overslaan (alleen publish/create worden verwerkt)`
      );
      return res.status(200).json({ message: 'Event type not handled, skipping' });
    }

    const teamMemberId = sys.id;
    const teamMemberName =
      fields?.name?.['nl-NL'] || fields?.name?.['nl'] || fields?.name || 'Unknown';

    console.log(`🚀 Team member webhook ontvangen voor: ${teamMemberName} (${teamMemberId})`);

    // Check if Management API token is configured
    if (!MGMT_TOKEN) {
      console.error(
        '❌ CTF_MANAGEMENT_TOKEN of CMAACCESSTOKEN environment variable niet geconfigureerd!'
      );
      return res.status(500).json({
        error: 'Management API token not configured',
        details: 'Please set CTF_MANAGEMENT_TOKEN or CMAACCESSTOKEN environment variable in Vercel'
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
        client = createClient({ accessToken: MGMT_TOKEN });
        space = await client.getSpace(SPACE_ID);
        env = await space.getEnvironment(ENV_ID);
        console.log('✅ Nieuwe Contentful client geïnitialiseerd');
      } catch (clientError) {
        console.error('❌ Kon Contentful client niet initialiseren:', clientError.message);
        return res.status(500).json({
          error: 'Failed to initialize Contentful client',
          details: clientError.message.includes('accessToken')
            ? 'Invalid or missing Management API token. Check CTF_MANAGEMENT_TOKEN or CMAACCESSTOKEN.'
            : clientError.message
        });
      }
    }

    // Check of er al een Aboutpage bestaat voor deze team member (met pageType Teammemberpage)
    const existingPages = await env.getEntries({
      content_type: 'aboutpage',
      'fields.pageType': 'Teammemberpage',
      'fields.teamMember.sys.id': teamMemberId,
      limit: 1
    });

    let teamMemberPage;

    if (existingPages.items.length > 0) {
      // Update bestaande page
      teamMemberPage = existingPages.items[0];
      console.log(`📝 Bestaande Aboutpage (Teammemberpage) gevonden: ${teamMemberPage.sys.id}`);
    } else {
      // Create nieuwe Aboutpage met pageType Teammemberpage
      const slug = `/team/${createSlugFromName(teamMemberName)}`;

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

      console.log(`✅ Aboutpage (Teammemberpage) aangemaakt: ${teamMemberPage.sys.id}`);
    }

    // Update de team member page met de laatste data
    const currentSlug = createSlugFromName(teamMemberName);
    const fullSlug = `/team/${currentSlug}`;

    if (!teamMemberPage.fields.slug || teamMemberPage.fields.slug['nl-NL'] !== fullSlug) {
      teamMemberPage.fields.slug = {
        'nl-NL': fullSlug
      };
    }

    // Update title als die gewijzigd is
    if (!teamMemberPage.fields.title || teamMemberPage.fields.title['nl-NL'] !== teamMemberName) {
      teamMemberPage.fields.title = {
        'nl-NL': teamMemberName
      };
    }

    // Update pageType als die niet correct is
    if (
      !teamMemberPage.fields.pageType ||
      teamMemberPage.fields.pageType['nl-NL'] !== 'Teammemberpage'
    ) {
      teamMemberPage.fields.pageType = {
        'nl-NL': 'Teammemberpage'
      };
    }

    // Update de link naar de team member
    teamMemberPage.fields.teamMember = {
      'nl-NL': {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: teamMemberId
        }
      }
    };

    // Save changes
    teamMemberPage = await teamMemberPage.update();

    // Publish de page
    if (!teamMemberPage.isPublished()) {
      teamMemberPage = await teamMemberPage.publish();
      console.log(`📢 Teammemberpage gepubliceerd: ${teamMemberPage.sys.id}`);
    }

    // Update TeamMember entry om link naar Aboutpage te zetten
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
          console.log(`🔗 Link naar Aboutpage gezet in TeamMember (${locale})`);
        }
      }

      if (linkUpdated) {
        teamMemberEntry.fields.link = currentLink;
        const updatedTeamMember = await teamMemberEntry.update();

        // Publish als het al gepubliceerd was
        if (updatedTeamMember.isPublished()) {
          await updatedTeamMember.publish();
          console.log(`📢 TeamMember entry geüpdatet met link naar Aboutpage`);
        }
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
