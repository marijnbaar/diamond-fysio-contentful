import 'dotenv/config';
import { createClient } from 'contentful-management';

const SPACE_ID = (process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID)!;
const ENV_ID = (process.env.CTF_ENV_ID || process.env.ENV_ID || 'master')!;
const MGMT_TOKEN = (process.env.CTF_MANAGEMENT_TOKEN || process.env.CMAACCESSTOKEN)!;

const ENTRY_ID = '1YWqNSfMKhf87y1I5Ep3MB';
const ASSET_ID = '2AnHl7PMK7bKXytWuROYPJ';

const client = createClient({ accessToken: MGMT_TOKEN });

async function main() {
  try {
    const space = await client.getSpace(SPACE_ID);
    const env = await space.getEnvironment(ENV_ID);

    console.log('🔍 Opzoeken van specialisatie entry...\n');
    console.log(`Entry ID: ${ENTRY_ID}`);
    console.log(`Asset ID (probleem): ${ASSET_ID}\n`);

    // Fetch the entry
    const entry = await env.getEntry(ENTRY_ID);

    console.log('📋 Entry Details:');
    console.log(`  Content Type: ${entry.sys.contentType.sys.id}`);
    console.log(`  Created: ${entry.sys.createdAt}`);
    console.log(`  Updated: ${entry.sys.updatedAt}`);
    console.log(`  Published: ${entry.isPublished() ? 'Ja' : 'Nee'}`);
    console.log(`  Archived: ${entry.isArchived() ? 'Ja ⚠️' : 'Nee'}\n`);

    // Get fields for all locales
    console.log('📝 Fields:');
    const fields = entry.fields;

    if (fields.title) {
      console.log('\n  Title:');
      Object.entries(fields.title).forEach(([locale, value]) => {
        console.log(`    ${locale}: ${value}`);
      });
    }

    if (fields.subtitle) {
      console.log('\n  Subtitle:');
      Object.entries(fields.subtitle).forEach(([locale, value]) => {
        console.log(`    ${locale}: ${value}`);
      });
    }

    if (fields.image) {
      console.log('\n  Image field:');
      Object.entries(fields.image).forEach(([locale, value]: [string, any]) => {
        if (value && value.sys) {
          const linkedAssetId = value.sys.id;
          console.log(`    ${locale}:`);
          console.log(`      Asset ID: ${linkedAssetId}`);
          console.log(
            `      Is problem asset: ${linkedAssetId === ASSET_ID ? '⚠️ JA - DIT IS HET PROBLEEM!' : 'Nee'}`
          );
        } else {
          console.log(`    ${locale}: (geen asset)`);
        }
      });
    }

    // Try to fetch the asset to see if it exists
    console.log(`\n🔍 Controleren of asset ${ASSET_ID} bestaat...`);
    try {
      const asset = await env.getAsset(ASSET_ID);
      console.log(`  ✅ Asset bestaat:`);
      console.log(
        `    Title: ${asset.fields.title?.[Object.keys(asset.fields.title || {})[0]] || 'Geen title'}`
      );
      console.log(`    Published: ${asset.isPublished() ? 'Ja' : 'Nee ⚠️'}`);
      console.log(`    Archived: ${asset.isArchived() ? 'Ja ⚠️' : 'Nee'}`);
    } catch (assetError: any) {
      if (assetError.status === 404) {
        console.log(`  ❌ Asset bestaat NIET of is verwijderd!`);
      } else {
        console.log(`  ❌ Fout bij ophalen asset: ${assetError.message}`);
      }
    }

    console.log('\n💡 Oplossing:');
    console.log('  1. Ga naar Contentful → Specialisation entry met bovenstaande title');
    console.log('  2. Verwijder de link naar het image asset OF voeg een nieuw asset toe');
    console.log(`  3. Publiceer de entry opnieuw\n`);
  } catch (error: any) {
    console.error('❌ Fout:', error.message);
    if (error.status === 404) {
      console.error(`\nEntry ${ENTRY_ID} bestaat niet of is verwijderd.`);
    }
    process.exit(1);
  }
}

main();
