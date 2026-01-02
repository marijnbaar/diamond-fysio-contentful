/**
 * Contentful Data Import Script voor Therapeuten Booking Links
 *
 * Dit script:
 * 1. Zoekt bestaande TeamMember entries
 * 2. Update hun bookingLink en bookingType velden
 * 3. Linkt therapeuten aan de AppointmentCardOverview
 *
 * Gebruik: node scripts/import-therapists-data.js
 */

require('dotenv').config({ path: '.env.local' });
const contentful = require('contentful-management');

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN;
const ENVIRONMENT = 'master';

// Default booking link voor de meeste therapeuten
const DEFAULT_SMARTFILE_LINK =
  'https://api.spotonmedics.nl/login/checkpraktijktoken?praktijktoken=IVUhe6t7x9AjnzKBv9rCTevZew2C7M7Q9FiPnMWg1AgGivMHZtZtJKuNCCC4p%2BKKJA4IwDqKwVJPcnu%2BvxaWY2M3d2N%2BQ6v6YPTBrYNtmII%3D';

// Therapeuten data (zoals hardcoded in de oude component)
const THERAPISTS_DATA = [
  // Smartfile therapeuten
  { name: 'Iva Lešić', bookingType: 'smartfile', bookingLink: DEFAULT_SMARTFILE_LINK },
  { name: 'Laszlo Gèleng', bookingType: 'smartfile', bookingLink: DEFAULT_SMARTFILE_LINK },
  { name: 'Menno de Vries', bookingType: 'smartfile', bookingLink: DEFAULT_SMARTFILE_LINK },
  { name: 'Regi Severins', bookingType: 'smartfile', bookingLink: DEFAULT_SMARTFILE_LINK },
  {
    name: 'Robin Rosa Pennings',
    bookingType: 'smartfile',
    bookingLink: DEFAULT_SMARTFILE_LINK
  },
  { name: 'Rutger Klauwers', bookingType: 'smartfile', bookingLink: DEFAULT_SMARTFILE_LINK },
  {
    name: 'Benjamin Soerel',
    bookingType: 'smartfile',
    bookingLink:
      'https://web.smartfile.nl/booking/practise/c0e5560a-eae4-4856-a8a1-fa4b30593a66/public_therapists/b22865ed-730e-4d50-8510-7554cd8adb21'
  },

  // Email therapeuten
  { name: 'Ton Willemsen', bookingType: 'email', bookingLink: 'tonwillemsen@me.com' },
  { name: 'Lidia Bernabei', bookingType: 'email', bookingLink: 'info@mymedidiet.com' },
  { name: 'Niels', bookingType: 'email', bookingLink: 'info@osteopathie-tuijl.nl' },
  { name: 'Leila', bookingType: 'email', bookingLink: 'leilaspilates@gmail.com' }
];

async function findTeamMemberByName(environment, name) {
  const entries = await environment.getEntries({
    content_type: 'teamMember',
    'fields.name[match]': name,
    limit: 1
  });

  return entries.items.length > 0 ? entries.items[0] : null;
}

async function importTherapistsData() {
  console.log('🚀 Starting therapists data import...\n');

  if (!SPACE_ID || !ACCESS_TOKEN) {
    console.error(
      '❌ Error: CONTENTFUL_SPACE_ID en CONTENT_MANAGEMENT_TOKEN moeten ingesteld zijn in .env.local'
    );
    process.exit(1);
  }

  try {
    const client = contentful.createClient({
      accessToken: ACCESS_TOKEN
    });

    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENVIRONMENT);

    console.log('✅ Connected to Contentful\n');

    const updatedTherapists = [];
    const notFoundTherapists = [];

    // Update each therapist
    console.log('📝 Updating therapist booking information...\n');

    for (const therapistData of THERAPISTS_DATA) {
      console.log(`  Processing: ${therapistData.name}...`);

      const entry = await findTeamMemberByName(environment, therapistData.name);

      if (!entry) {
        console.log(`  ⚠️  Not found in Contentful: ${therapistData.name}`);
        notFoundTherapists.push(therapistData.name);
        continue;
      }

      // Update the fields
      entry.fields.bookingLink = {
        nl: therapistData.bookingLink,
        'en-US': therapistData.bookingLink
      };

      entry.fields.bookingType = {
        nl: therapistData.bookingType,
        'en-US': therapistData.bookingType
      };

      const updatedEntry = await entry.update();
      await updatedEntry.publish();

      console.log(`  ✅ Updated and published: ${therapistData.name}`);
      updatedTherapists.push({
        id: entry.sys.id,
        name: therapistData.name
      });
    }

    console.log('\n📊 Summary:');
    console.log(`  ✅ Updated: ${updatedTherapists.length} therapeuten`);
    console.log(`  ⚠️  Not found: ${notFoundTherapists.length} therapeuten\n`);

    if (notFoundTherapists.length > 0) {
      console.log('⚠️  Not found therapeuten:');
      notFoundTherapists.forEach((name) => console.log(`    - ${name}`));
      console.log(
        '\n💡 Tip: Zorg dat deze therapeuten eerst aangemaakt zijn in Contentful als TeamMember entries\n'
      );
    }

    // === STEP 2: Link therapeuten to AppointmentCardOverview ===
    console.log('📝 Linking therapeuten to AppointmentCardOverview...\n');

    // Find the AppointmentCardOverview entry (usually "Maak een afspraak")
    const appointmentEntries = await environment.getEntries({
      content_type: 'appointmentCardOverview',
      limit: 10
    });

    if (appointmentEntries.items.length === 0) {
      console.log('⚠️  No AppointmentCardOverview entries found');
      console.log(
        '💡 Create an AppointmentCardOverview entry in Contentful first, then re-run this script\n'
      );
    } else {
      // Update the first AppointmentCardOverview entry
      const appointmentEntry = appointmentEntries.items[0];
      const entryTitle =
        appointmentEntry.fields.title?.['nl'] || appointmentEntry.fields.title?.['en-US'] || 'N/A';

      console.log(`  Found AppointmentCardOverview: "${entryTitle}"`);

      // Create references to all updated therapists
      const therapistReferences = updatedTherapists.map((t) => ({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: t.id
        }
      }));

      appointmentEntry.fields.therapists = {
        nl: therapistReferences,
        'en-US': therapistReferences
      };

      const updatedAppointment = await appointmentEntry.update();
      await updatedAppointment.publish();

      console.log(`  ✅ Linked ${updatedTherapists.length} therapeuten to AppointmentCardOverview`);
      console.log(`  ✅ Published AppointmentCardOverview\n`);
    }

    console.log('🎉 Import complete!\n');
    console.log('Next steps:');
    console.log('1. Check Contentful web interface to verify the data');
    console.log('2. Test your application locally');
    console.log('3. Deploy to production\n');
    console.log(
      '💡 Tip: Je kunt nu de booking links beheren via Contentful in plaats van in de code!\n'
    );
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details?.errors) {
      console.error('Details:', JSON.stringify(error.details.errors, null, 2));
    }
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

importTherapistsData();
