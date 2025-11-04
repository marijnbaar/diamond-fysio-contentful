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
  // Contentful webhooks hebben geen signature in de body, maar je kunt de secret gebruiken
  // om te verifiëren via authorization header
  const authHeader = req.headers.authorization || req.headers['x-contentful-webhook-secret'];

  if (WEBHOOK_SECRET && authHeader) {
    return authHeader === `Bearer ${WEBHOOK_SECRET}` || authHeader === WEBHOOK_SECRET;
  }

  // Als er geen secret is geconfigureerd, accepteer alle requests (alleen voor development!)
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️  WEBHOOK_SECRET niet geconfigureerd - webhook verificatie wordt overgeslagen');
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
    const { sys, fields } = req.body;

    // Check of dit een TeamMember entry is
    if (sys?.contentType?.sys?.id !== 'teamMember') {
      console.log(
        `ℹ️  Webhook ontvangen voor ${sys?.contentType?.sys?.id}, geen teamMember - overslaan`
      );
      return res.status(200).json({ message: 'Not a team member entry, skipping' });
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

    // Initialize Contentful Management API client
    const client = createClient({ accessToken: MGMT_TOKEN });
    const space = await client.getSpace(SPACE_ID);
    const env = await space.getEnvironment(ENV_ID);

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
