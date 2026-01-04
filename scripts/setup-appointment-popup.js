/**
 * Contentful Setup Script voor Appointment Popup
 *
 * Dit script:
 * 1. Voegt popup velden toe aan AppointmentCardOverview content type
 * 2. Activeert de popup met de juiste tekst
 *
 * Gebruik: node scripts/setup-appointment-popup.js
 */

require('dotenv').config({ path: '.env.local' });
const contentful = require('contentful-management');

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN;
const ENVIRONMENT = 'master';

async function setupAppointmentPopup() {
  console.log('🚀 Starting appointment popup setup...\n');

  if (!SPACE_ID || !ACCESS_TOKEN) {
    console.error(
      '❌ Error: CONTENTFUL_SPACE_ID en CONTENT_MANAGEMENT_TOKEN moeten ingesteld zijn in .env.local'
    );
    process.exit(1);
  }

  try {
    // Connect to Contentful
    const client = contentful.createClient({
      accessToken: ACCESS_TOKEN
    });

    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENVIRONMENT);

    console.log('✅ Connected to Contentful\n');

    // === STEP 1: Update AppointmentCardOverview content type ===
    console.log('📝 Step 1: Updating AppointmentCardOverview content type...');

    const appointmentType = await environment.getContentType('appointmentCardOverview');
    const appointmentFields = appointmentType.fields;

    // Check if popup fields already exist
    const hasShowPopup = appointmentFields.some((f) => f.id === 'showPopup');
    const hasPopupText = appointmentFields.some((f) => f.id === 'popupText');
    const hasPopupEmail = appointmentFields.some((f) => f.id === 'popupEmail');

    let needsUpdate = false;

    if (!hasShowPopup) {
      console.log('  ➕ Adding showPopup field...');
      appointmentFields.push({
        id: 'showPopup',
        name: 'Show Popup',
        type: 'Boolean',
        localized: false,
        required: false,
        disabled: false,
        omitted: false
      });
      needsUpdate = true;
    } else {
      console.log('  ✓ showPopup field already exists');
    }

    if (!hasPopupText) {
      console.log('  ➕ Adding popupText field...');
      appointmentFields.push({
        id: 'popupText',
        name: 'Popup Text',
        type: 'Symbol',
        localized: false,
        required: false,
        disabled: false,
        omitted: false,
        validations: [
          {
            size: { max: 250 }
          }
        ]
      });
      needsUpdate = true;
    } else {
      console.log('  ✓ popupText field already exists');
    }

    if (!hasPopupEmail) {
      console.log('  ➕ Adding popupEmail field...');
      appointmentFields.push({
        id: 'popupEmail',
        name: 'Popup Email',
        type: 'Symbol',
        localized: false,
        required: false,
        disabled: false,
        omitted: false,
        validations: []
      });
      needsUpdate = true;
    } else {
      console.log('  ✓ popupEmail field already exists');
    }

    if (needsUpdate) {
      appointmentType.fields = appointmentFields;
      await appointmentType.update();
      console.log('  ✅ AppointmentCardOverview content type updated');

      // Publish the updated content type
      const updatedAppointmentType = await environment.getContentType('appointmentCardOverview');
      await updatedAppointmentType.publish();
      console.log('  ✅ AppointmentCardOverview content type published\n');
    } else {
      console.log('  ℹ️  No updates needed for AppointmentCardOverview\n');
    }

    // === STEP 2: Activate popup on the appointment page ===
    console.log('📝 Step 2: Activating popup on appointment page...');

    // Find the "Maak een afspraak" entry
    const entries = await environment.getEntries({
      content_type: 'appointmentCardOverview',
      limit: 100
    });

    if (entries.items.length === 0) {
      console.log('  ⚠️  No AppointmentCardOverview entries found');
      console.log('\n✅ Setup complete! Fields added but no entries to update.');
      return;
    }

    // Update the first entry (usually there's only one)
    const appointmentEntry = entries.items[0];
    const entryTitle =
      appointmentEntry.fields.title?.['nl'] ||
      appointmentEntry.fields.title?.['en-US'] ||
      'Unknown';

    console.log(`  📄 Found entry: "${entryTitle}"`);

    // Update the popup fields
    appointmentEntry.fields.showPopup = {
      'nl-NL': true,
      'en-US': true
    };

    appointmentEntry.fields.popupText = {
      'nl-NL':
        'Door de overgang naar een nieuw boekingssysteem zijn nog niet alle therapeuten online te boeken. Voor afspraken kunt u mailen naar',
      'en-US':
        'Due to the transition to a new booking system, not all therapists can be booked online yet. For appointments, please email'
    };

    appointmentEntry.fields.popupEmail = {
      'nl-NL': 'info@diamondfysio.nl',
      'en-US': 'info@diamondfysio.nl'
    };

    await appointmentEntry.update();
    console.log('  ✅ Entry updated with popup data');

    // Publish the entry
    const updatedEntry = await environment.getEntry(appointmentEntry.sys.id);
    await updatedEntry.publish();
    console.log('  ✅ Entry published');

    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Summary:');
    console.log('  ✓ Popup fields added to AppointmentCardOverview');
    console.log('  ✓ Popup activated on appointment page');
    console.log('  ✓ Popup text: "Door de overgang naar een nieuw boekingssysteem..."');
    console.log('  ✓ Popup email: info@diamondfysio.nl');
    console.log('\nDe popup verschijnt nu automatisch op /afspraak-maken!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

setupAppointmentPopup();
