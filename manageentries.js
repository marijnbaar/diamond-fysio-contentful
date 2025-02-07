require('dotenv').config();
const contentfulManagement = require('contentful-management');

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.ENV_ID;
const CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = process.env.CMAACCESSTOKEN;

// Controleer of alle variabelen beschikbaar zijn
if (!CONTENTFUL_SPACE_ID || !ENV_ID || !CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) {
  console.error('Eén of meerdere vereiste environment variables ontbreken.');
  process.exit(1);
}

// Maak de CMA-client aan
const client = contentfulManagement.createClient({
  accessToken: CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
});

async function moveEntries(sourceContentTypeId, targetContentTypeId) {
  try {
    const space = await client.getSpace(CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment(ENV_ID);

    // Fetch entries from the source content type
    const entries = await environment.getEntries({
      content_type: sourceContentTypeId
    });

    for (const entry of entries.items) {
      // Ensure the entry is not archived
      if (entry.isArchived()) {
        await entry.unarchive();
      }

      // Ensure the entry is published
      if (!entry.isPublished()) {
        await entry.publish();
      }

      // Prepare fields for the new entry
      const newFields = {
        ...entry.fields
      };

      // Create a new entry in the target content type with the same data
      const newEntry = await environment.createEntry(targetContentTypeId, {
        fields: newFields
      });

      // Optionally, publish the new entry
      await newEntry.publish();

      // Optionally, delete the old entry
      await entry.unpublish();
      //   await entry.delete();

      console.log(`Moved entry ${entry.sys.id} to new content type ${targetContentTypeId}`);
    }
  } catch (error) {
    console.error('Failed to move entries:', error);
  }
}

// Call the function with the correct content type IDs
moveEntries('specialisationpage', 'aboutpage').catch(console.error); // Replace with your content type IDs
