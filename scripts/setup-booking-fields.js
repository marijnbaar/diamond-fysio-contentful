/**
 * Contentful Setup Script voor Booking Links
 *
 * Dit script:
 * 1. Voegt 'bookingLink' en 'bookingType' velden toe aan TeamMember content type
 * 2. Voegt 'therapists' reference veld toe aan AppointmentCardOverview
 *
 * Gebruik: node scripts/setup-booking-fields.js
 */

require('dotenv').config({ path: '.env.local' });
const contentful = require('contentful-management');

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENT_MANAGEMENT_TOKEN;
const ENVIRONMENT = 'master'; // Of 'development' als je een andere environment gebruikt

async function setupBookingFields() {
  console.log('🚀 Starting Contentful booking fields setup...\n');

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

    // === STEP 1: Update TeamMember content type ===
    console.log('📝 Step 1: Updating TeamMember content type...');

    const teamMemberType = await environment.getContentType('teamMember');
    const teamMemberFields = teamMemberType.fields;

    // Check if bookingLink field already exists
    const hasBookingLink = teamMemberFields.some((f) => f.id === 'bookingLink');
    const hasBookingType = teamMemberFields.some((f) => f.id === 'bookingType');

    if (!hasBookingLink) {
      console.log('  ➕ Adding bookingLink field to TeamMember...');
      teamMemberFields.push({
        id: 'bookingLink',
        name: 'Booking Link',
        type: 'Symbol',
        localized: false,
        required: false,
        disabled: false,
        omitted: false,
        validations: []
      });
    } else {
      console.log('  ✓ bookingLink field already exists');
    }

    if (!hasBookingType) {
      console.log('  ➕ Adding bookingType field to TeamMember...');
      teamMemberFields.push({
        id: 'bookingType',
        name: 'Booking Type',
        type: 'Symbol',
        localized: false,
        required: false,
        disabled: false,
        omitted: false,
        validations: [
          {
            in: ['smartfile', 'email', 'none']
          }
        ]
      });
    } else {
      console.log('  ✓ bookingType field already exists');
    }

    if (!hasBookingLink || !hasBookingType) {
      teamMemberType.fields = teamMemberFields;
      await teamMemberType.update();
      console.log('  ✅ TeamMember content type updated');

      // Publish the updated content type
      const updatedTeamMemberType = await environment.getContentType('teamMember');
      await updatedTeamMemberType.publish();
      console.log('  ✅ TeamMember content type published\n');
    } else {
      console.log('  ℹ️  No updates needed for TeamMember\n');
    }

    // === STEP 2: Update AppointmentCardOverview content type ===
    console.log('📝 Step 2: Updating AppointmentCardOverview content type...');

    const appointmentType = await environment.getContentType('appointmentCardOverview');
    const appointmentFields = appointmentType.fields;

    // Check if therapists field already exists
    const hasTherapists = appointmentFields.some((f) => f.id === 'therapists');

    if (!hasTherapists) {
      console.log('  ➕ Adding therapists reference field to AppointmentCardOverview...');
      appointmentFields.push({
        id: 'therapists',
        name: 'Therapists',
        type: 'Array',
        localized: false,
        required: false,
        disabled: false,
        omitted: false,
        items: {
          type: 'Link',
          linkType: 'Entry',
          validations: [
            {
              linkContentType: ['teamMember']
            }
          ]
        }
      });

      appointmentType.fields = appointmentFields;
      await appointmentType.update();
      console.log('  ✅ AppointmentCardOverview content type updated');

      // Publish the updated content type
      const updatedAppointmentType = await environment.getContentType('appointmentCardOverview');
      await updatedAppointmentType.publish();
      console.log('  ✅ AppointmentCardOverview content type published\n');
    } else {
      console.log('  ℹ️  therapists field already exists\n');
    }

    console.log('🎉 Setup complete!\n');
    console.log('Next steps:');
    console.log('1. Run: node scripts/import-therapists-data.js');
    console.log('2. Check Contentful web interface to verify the new fields');
    console.log('3. Deploy your application to use the new booking system\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.details?.errors) {
      console.error('Details:', JSON.stringify(error.details.errors, null, 2));
    }
    process.exit(1);
  }
}

setupBookingFields();
