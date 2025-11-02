#!/usr/bin/env tsx
/**
 * Script to generate AI alt-texts for images in Contentful
 *
 * Usage:
 *   - Generate for all images without descriptions: tsx scripts/generate-alt-texts.ts
 *   - Generate for specific asset: tsx scripts/generate-alt-texts.ts --assetId=xxx
 *   - Overwrite existing: tsx scripts/generate-alt-texts.ts --force
 *   - Test mode (no updates): tsx scripts/generate-alt-texts.ts --dryRun
 */

import 'dotenv/config';
import { createClient } from 'contentful-management';

type Args = {
  assetId?: string | null;
  force?: boolean;
  dryRun?: boolean;
  locale?: string;
  maxAssets?: number;
};

function parseArgs(): Args {
  const arg = Object.fromEntries(
    process.argv.slice(2).map((p) => {
      const [k, v = ''] = p.replace(/^--/, '').split('=');
      return [k, v];
    })
  ) as Record<string, string>;

  return {
    assetId: arg.assetId || arg.asset_id || null,
    force: 'force' in arg || arg.force === 'true',
    dryRun: 'dryRun' in arg || arg.dry_run === 'true' || arg.test === 'true',
    locale: arg.locale || 'nl-NL',
    maxAssets: arg.max ? parseInt(arg.max, 10) : undefined,
    titles: 'titles' in arg || arg.titles === 'true',
    allLocales: 'allLocales' in arg || arg.all_locales === 'true' || arg.all === 'true'
  };
}

const SPACE_ID = (process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID)!;
const ENV_ID = (process.env.CTF_ENV_ID || process.env.ENV_ID || 'master')!;
const MGMT_TOKEN = (process.env.CTF_MANAGEMENT_TOKEN || process.env.CMAACCESSTOKEN)!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

const client = createClient({ accessToken: MGMT_TOKEN });

/**
 * Generate asset title using OpenAI Vision API
 */
async function generateAssetTitle(
  imageUrl: string,
  fileName: string,
  targetLang: string,
  context?: string
): Promise<string> {
  const apiKey = OPENAI_API_KEY!;
  const model = 'gpt-4o'; // GPT-4o supports vision

  const isEnglish = targetLang === 'en-US' || targetLang.startsWith('en');
  const langInstruction = isEnglish
    ? 'Write in English. Use English keywords for physiotherapy terms.'
    : 'Write in Dutch. Use Dutch keywords for physiotherapy terms.';

  const systemPrompt = `You are an expert at creating descriptive, SEO-friendly file titles for images on a physiotherapy website.

Guidelines:
- Create short, descriptive titles (3-8 words max)
- Use lowercase, hyphens for spaces
- Be specific: describe what the image shows
- Include relevant keywords for physiotherapy/healthcare
- Format: kebab-case (e.g., "physiotherapist-treating-back-pain" or "fysiotherapeut-behandelt-rugklachten")
- Avoid generic terms like "image", "photo", "afbeelding", "picture"
- For team photos: use person's name if known (e.g., "jan-jansen-fysiotherapeut" or "jan-jansen-physiotherapist")
- For treatments: describe the treatment (e.g., "dry-needling-shoulder-treatment" or "dry-needling-schouder-behandeling")
${langInstruction}

${context ? `Context: ${context}` : ''}

Return ONLY the title in kebab-case, nothing else.`;

  const userPrompt = context
    ? `Generate a descriptive file title for this image in ${targetLang}. Context: ${context}. Original filename: ${fileName}`
    : `Generate a descriptive file title for this image in ${targetLang}. Original filename: ${fileName}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'auto'
                }
              }
            ]
          }
        ],
        max_tokens: 50,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} ${errorText}`);
    }

    const json = (await response.json()) as any;
    const content: string | undefined = json?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('OpenAI response missing content');
    }

    // Clean up and format to kebab-case
    let title = content.trim().toLowerCase();
    // Remove quotes if wrapped
    title = title.replace(/^["']|["']$/g, '');
    // Replace spaces and special chars with hyphens
    title = title.replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');

    // If title is too generic or empty, use fallback
    if (!title || title.length < 3 || title.match(/^(image|photo|img|afbeelding|foto)/i)) {
      title = fileName
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^\w]+/g, '-');
    }

    return title;
  } catch (error) {
    console.error('[generateAssetTitle] Error:', error);
    throw error;
  }
}

/**
 * Generate alt-text using OpenAI Vision API
 */
async function generateAltText(
  imageUrl: string,
  targetLang: string,
  context?: string
): Promise<string> {
  const apiKey = OPENAI_API_KEY!;
  const model = 'gpt-4o'; // GPT-4o supports vision

  const isEnglish = targetLang === 'en-US' || targetLang.startsWith('en');
  const langInstruction = isEnglish
    ? `Write in English. Use terms like "physiotherapist", "patient", "treatment". Example: "Physiotherapist treating patient with back pain at Diamond Fysio Amsterdam."`
    : `Write in Dutch. Use terms like "fysiotherapeut", "patiënt", "behandeling". Example: "Fysiotherapeut behandelt patiënt met rugklachten bij Diamond Fysio Amsterdam."`;

  const systemPrompt = `You are an SEO expert writing alt-text descriptions for images on a physiotherapy website (Diamond Fysio Amsterdam).

Guidelines:
- Write descriptive, specific alt-texts (5-15 words)
- Describe what is visible in the image
- Include context relevant to physiotherapy/healthcare
- Use natural, conversational language
${langInstruction}
- For logos: ${isEnglish ? '"Diamond Fysio Amsterdam logo"' : '"Diamond Fysio Amsterdam logo"'}
- For team photos: ${isEnglish ? '"Portrait of [name], physiotherapist at Diamond Fysio Amsterdam"' : '"Portret van [name], fysiotherapeut bij Diamond Fysio Amsterdam"'}
- For treatments: ${isEnglish ? '"Physiotherapist treating patient with [condition]"' : '"Fysiotherapeut behandelt patiënt met [condition]"'}
- For facilities: ${isEnglish ? '"Treatment room at Diamond Fysio in Amsterdam"' : '"Behandelruimte bij Diamond Fysio in Amsterdam"'}

${context ? `Context: ${context}` : ''}

Return ONLY the alt-text description in ${targetLang}, nothing else.`;

  const userPrompt = context
    ? `Generate a professional alt-text for this image in ${targetLang}. Context: ${context}`
    : `Generate a professional alt-text for this image in ${targetLang}.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'auto' // 'low', 'high', or 'auto'
                }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} ${errorText}`);
    }

    const json = (await response.json()) as any;
    const content: string | undefined = json?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('OpenAI response missing content');
    }

    // Clean up the response (remove quotes if wrapped)
    return content.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('[generateAltText] Error:', error);
    throw error;
  }
}

/**
 * Update asset title in Contentful
 */
async function updateAssetTitle(
  env: any,
  asset: any,
  title: string,
  locale: string,
  dryRun: boolean
): Promise<boolean> {
  try {
    if (dryRun) {
      console.log(`[DRY RUN] Would update asset title ${asset.sys.id}: "${title}"`);
      return true;
    }

    // Check if title already exists and is the same
    const existingTitle = asset.fields.title?.[locale];
    if (existingTitle && existingTitle.trim() === title.trim()) {
      console.log(`  ℹ️  Title unchanged, skipping update`);
      return true;
    }

    const isPublished = asset.isPublished();

    if (isPublished) {
      try {
        await asset.unpublish();
      } catch (unpublishError: any) {
        if (unpublishError.status !== 409 && unpublishError.statusText !== 'Conflict') {
          console.error(`  ❌ Unpublish failed: ${unpublishError.message}`);
          return false;
        }
      }

      const freshAsset = await env.getAsset(asset.sys.id);
      freshAsset.fields.title = freshAsset.fields.title || {};
      freshAsset.fields.title[locale] = title;
      const updatedAsset = await freshAsset.update();

      try {
        const processedAsset = await updatedAsset.processForAllLocales();
        await processedAsset.publish();
      } catch (processError: any) {
        if (processError.status === 404 || processError.message?.includes('not found')) {
          await updatedAsset.publish();
        } else {
          const checkAsset = await env.getAsset(asset.sys.id);
          const checkTitle = checkAsset.fields.title?.[locale];
          if (checkTitle && checkTitle.trim() === title.trim()) {
            console.log(`  ✅ Title saved successfully (publish skipped)`);
            return true;
          }
          console.error(`  ❌ Processing/publish failed: ${processError.message}`);
          return false;
        }
      }
    } else {
      asset.fields.title = asset.fields.title || {};
      asset.fields.title[locale] = title;
      const updatedAsset = await asset.update();

      try {
        const processedAsset = await updatedAsset.processForAllLocales();
        await processedAsset.publish();
      } catch (processError: any) {
        if (processError.status === 404 || processError.message?.includes('not found')) {
          await updatedAsset.publish();
        } else {
          const checkAsset = await env.getAsset(asset.sys.id);
          const checkTitle = checkAsset.fields.title?.[locale];
          if (checkTitle && checkTitle.trim() === title.trim()) {
            console.log(`  ✅ Title saved successfully (publish skipped)`);
            return true;
          }
          console.error(`  ❌ Processing/publish failed: ${processError.message}`);
          return false;
        }
      }
    }

    return true;
  } catch (error: any) {
    console.error(`[updateAssetTitle] Failed for ${asset.sys.id}:`, error.message);
    return false;
  }
}

/**
 * Update asset description in Contentful
 */
async function updateAssetDescription(
  env: any,
  asset: any,
  description: string,
  locale: string,
  dryRun: boolean
): Promise<boolean> {
  try {
    if (dryRun) {
      console.log(`[DRY RUN] Would update asset ${asset.sys.id}: "${description}"`);
      return true;
    }

    // Check if description already exists and is the same (skip update to avoid unnecessary processing)
    const existingDescription = asset.fields.description?.[locale];
    if (existingDescription && existingDescription.trim() === description.trim()) {
      console.log(`  ℹ️  Description unchanged, skipping update`);
      return true;
    }

    asset.fields.description = asset.fields.description || {};
    asset.fields.description[locale] = description;

    // Check if asset is published - need to handle differently
    const isPublished = asset.isPublished();

    if (isPublished) {
      // For published assets, we need to unpublish first
      try {
        await asset.unpublish();
      } catch (unpublishError: any) {
        // If unpublish fails with conflict, asset might already be unpublished
        if (unpublishError.status !== 409 && unpublishError.statusText !== 'Conflict') {
          console.error(`  ❌ Unpublish failed: ${unpublishError.message}`);
          return false;
        }
        // Continue anyway - might already be unpublished
      }

      // Re-fetch after unpublish to get fresh version
      const freshAsset = await env.getAsset(asset.sys.id);
      freshAsset.fields.description = freshAsset.fields.description || {};
      freshAsset.fields.description[locale] = description;
      const updatedAsset = await freshAsset.update();

      // Process and publish
      try {
        const processedAsset = await updatedAsset.processForAllLocales();
        await processedAsset.publish();
      } catch (processError: any) {
        // If processing fails, it might be because file doesn't exist in all locales
        // Try to publish anyway if the description update succeeded
        if (processError.status === 404 || processError.message?.includes('not found')) {
          console.log(
            `  ⚠️  Processing failed (file may not exist in all locales), trying direct publish...`
          );
          try {
            await updatedAsset.publish();
          } catch (publishError: any) {
            // Check if description was saved even if publish failed
            const checkAsset = await env.getAsset(asset.sys.id);
            const checkDescription = checkAsset.fields.description?.[locale];
            if (checkDescription && checkDescription.trim() === description.trim()) {
              console.log(`  ✅ Description saved successfully (publish skipped)`);
              return true;
            }
            console.error(
              `  ❌ Publish failed: ${publishError.message || publishError.statusText}`
            );
            return false;
          }
        } else {
          console.error(`  ❌ Processing failed: ${processError.message}`);
          return false;
        }
      }
    } else {
      // Asset is not published, simpler flow
      asset.fields.description = asset.fields.description || {};
      asset.fields.description[locale] = description;
      const updatedAsset = await asset.update();

      // Process and publish
      try {
        const processedAsset = await updatedAsset.processForAllLocales();
        await processedAsset.publish();
      } catch (processError: any) {
        // If processing fails, try to publish anyway
        if (processError.status === 404 || processError.message?.includes('not found')) {
          console.log(
            `  ⚠️  Processing skipped (file may not exist in all locales), publishing directly...`
          );
          await updatedAsset.publish();
        } else {
          // Check if description was saved even if publish failed
          const checkAsset = await env.getAsset(asset.sys.id);
          const checkDescription = checkAsset.fields.description?.[locale];
          if (checkDescription && checkDescription.trim() === description.trim()) {
            console.log(`  ✅ Description saved successfully (publish skipped)`);
            return true;
          }
          console.error(`  ❌ Processing/publish failed: ${processError.message}`);
          return false;
        }
      }
    }

    return true;
  } catch (error: any) {
    console.error(`[updateAssetDescription] Failed for ${asset.sys.id}:`, error.message);
    return false;
  }
}

/**
 * Get context from entries using this asset
 */
async function getAssetContext(env: any, assetId: string): Promise<string | null> {
  try {
    // Search for entries that reference this asset
    // This is a simplified approach - you might want to query specific content types
    const entries = await env.getEntries({
      limit: 5,
      links_to_asset: assetId
    });

    if (entries.items.length === 0) return null;

    // Get title/name from first entry
    const entry = entries.items[0];
    const sys = entry.sys;
    const contentType = sys.contentType?.sys?.id;

    // Try to extract meaningful context
    if (entry.fields.title) {
      const title =
        entry.fields.title['nl-NL'] || entry.fields.title[Object.keys(entry.fields.title)[0]];
      if (title) return `${contentType}: ${title}`;
    }

    if (entry.fields.name) {
      const name =
        entry.fields.name['nl-NL'] || entry.fields.name[Object.keys(entry.fields.name)[0]];
      if (name) return `${contentType}: ${name}`;
    }

    return contentType || null;
  } catch {
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  const args = parseArgs();
  const { assetId, force, dryRun, locale, maxAssets, titles, allLocales } = args;

  // Determine target locales
  const targetLocales = allLocales ? ['nl-NL', 'en-US'] : [locale];

  console.log('🚀 Starting alt-text generation...');
  if (titles) console.log('📝 Also improving asset titles');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will update Contentful)'}`);
  console.log(`Locales: ${targetLocales.join(', ')}`);
  if (force) console.log('⚠️  Force mode: Will overwrite existing descriptions/titles');
  console.log('');

  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENV_ID);

  let assetsToProcess: any[] = [];

  if (assetId) {
    // Process single asset
    try {
      const asset = await env.getAsset(assetId);
      assetsToProcess = [asset];
      console.log(`📦 Processing single asset: ${assetId}`);
    } catch (error: any) {
      console.error(`❌ Asset not found: ${assetId}`, error.message);
      process.exit(1);
    }
  } else {
    // Get all assets
    console.log('📦 Fetching all assets from Contentful...');
    let skip = 0;
    const limit = 100;
    let totalFetched = 0;

    while (true) {
      const response = await env.getAssets({
        skip,
        limit,
        order: '-sys.createdAt'
      });

      const assets = response.items;
      totalFetched += assets.length;

      for (const asset of assets) {
        // Check all locales for image files (assets might not have files in the requested locale)
        const fileFields = asset.fields.file || {};
        let isImage = false;
        let fileLocale = locale;
        let fileName = '';

        // Try requested locale first
        if (fileFields[locale]?.contentType?.startsWith('image/')) {
          isImage = true;
          fileName = fileFields[locale]?.fileName || asset.sys.id;
        } else {
          // Check all locales for image files
          for (const [loc, file] of Object.entries(fileFields)) {
            if ((file as any)?.contentType?.startsWith('image/')) {
              isImage = true;
              fileLocale = loc;
              fileName = (file as any)?.fileName || asset.sys.id;
              break;
            }
          }
        }

        if (!isImage) continue; // Skip non-image assets

        // Check description in all target locales
        let hasDescriptionInAnyTargetLocale = false;
        if (!allLocales) {
          // Single locale mode: check requested locale
          const currentDescription = asset.fields.description?.[locale];
          hasDescriptionInAnyTargetLocale =
            currentDescription && currentDescription.trim().length > 0;
        } else {
          // All locales mode: check if both NL and EN exist
          const hasNL =
            asset.fields.description?.['nl-NL'] &&
            asset.fields.description['nl-NL'].trim().length > 0;
          const hasEN =
            asset.fields.description?.['en-US'] &&
            asset.fields.description['en-US'].trim().length > 0;
          hasDescriptionInAnyTargetLocale = hasNL && hasEN;
        }

        if (!force && hasDescriptionInAnyTargetLocale && !allLocales) {
          // Skip if already has description in requested locale (unless force mode or allLocales)
          continue;
        }

        // For allLocales mode, we'll process anyway but skip individual locales that already have descriptions
        // Log why we're processing
        if (hasDescriptionInAnyTargetLocale && force) {
          const desc =
            asset.fields.description?.[locale] ||
            asset.fields.description?.['nl-NL'] ||
            asset.fields.description?.['en-US'] ||
            '';
          console.log(`  📝 Will overwrite: "${desc.substring(0, 50)}..."`);
        } else if (!hasDescriptionInAnyTargetLocale) {
          console.log(`  ➕ Will add description (currently empty)`);
        }

        assetsToProcess.push(asset);

        if (maxAssets && assetsToProcess.length >= maxAssets) break;
      }

      if (maxAssets && assetsToProcess.length >= maxAssets) break;
      if (!response.hasNextPage) break;

      skip += limit;
    }

    console.log(
      `📊 Found ${assetsToProcess.length} image assets to process (out of ${totalFetched} total assets)`
    );

    if (assetsToProcess.length === 0 && !force) {
      console.log('');
      console.log('💡 Tip: Use --force to overwrite existing descriptions/titles');
      console.log('   Example: yarn alt:generate:all --max=5');
      if (!titles) {
        console.log('   Or use --titles to also improve titles: yarn alt:generate --titles');
      }
    }
  }

  if (assetsToProcess.length === 0) {
    const message =
      titles && allLocales
        ? '✅ No assets to process. All images already have descriptions and titles in all locales!'
        : titles
          ? '✅ No assets to process. All images already have descriptions and titles!'
          : allLocales
            ? '✅ No assets to process. All images already have descriptions in all locales!'
            : '✅ No assets to process. All images already have descriptions!';
    console.log(message);
    if (!titles || !allLocales) {
      console.log('💡 Tips:');
      if (!titles) {
        console.log('   - Use --titles to also improve asset titles');
      }
      if (!allLocales) {
        console.log('   - Use --allLocales to generate for both NL and EN');
      }
      console.log('   Example: yarn alt:generate --titles --allLocales --max=5');
    }
    process.exit(0);
  }

  console.log('');
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < assetsToProcess.length; i++) {
    const asset = assetsToProcess[i];
    const assetId = asset.sys.id;
    // Get fileName from file field, not title (title is what we're updating)
    const fileFields = asset.fields.file || {};
    let fileName = '';
    for (const [loc, file] of Object.entries(fileFields)) {
      if ((file as any)?.fileName) {
        fileName = (file as any).fileName;
        break;
      }
    }
    if (!fileName) fileName = assetId;

    // Re-fetch asset to get latest state (descriptions might have been updated)
    let latestAsset;
    try {
      latestAsset = await env.getAsset(assetId);
    } catch (error: any) {
      console.error(`  ❌ Error fetching asset ${assetId}: ${error.message}`);
      errorCount++;
      continue;
    }

    // Check description in requested locale first, then check any locale
    let currentDescription = latestAsset.fields.description?.[locale];
    let hasDescription = currentDescription && currentDescription.trim().length > 0;

    // If not found in requested locale, check all locales
    if (!hasDescription && latestAsset.fields.description) {
      for (const [loc, desc] of Object.entries(latestAsset.fields.description)) {
        if (desc && typeof desc === 'string' && desc.trim().length > 0) {
          currentDescription = desc;
          hasDescription = true;
          break;
        }
      }
    }

    console.log(`[${i + 1}/${assetsToProcess.length}] Processing: ${fileName}`);

    // For allLocales mode, check per locale instead of skipping entire asset
    if (!allLocales && !force && hasDescription) {
      console.log(
        `  ⏭️  Skipped: Already has description: "${currentDescription.substring(0, 50)}..."`
      );
      skippedCount++;
      continue;
    }

    // Update asset reference to use latest
    let assetToUpdate = latestAsset;

    // Find file URL (try requested locale, then any locale)
    let fileUrl = assetToUpdate.fields.file?.[locale]?.url;
    if (!fileUrl) {
      // Try to find file in any locale
      const fileFields = assetToUpdate.fields.file || {};
      for (const [loc, file] of Object.entries(fileFields)) {
        if ((file as any)?.url) {
          fileUrl = (file as any).url;
          break;
        }
      }
    }

    if (!fileUrl) {
      console.log(`  ⚠️  Skipped: No file URL found for any locale`);
      skippedCount++;
      continue;
    }

    const imageUrl = fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl;

    try {
      // Get context if possible
      const context = await getAssetContext(env, assetId);

      let anyUpdateSuccess = false;

      // Process each target locale
      for (const targetLocale of targetLocales) {
        console.log(`  🌐 Processing locale: ${targetLocale}`);

        // Check if already has description/title in this locale
        const currentDescription = assetToUpdate.fields.description?.[targetLocale];
        const currentTitle = assetToUpdate.fields.title?.[targetLocale];
        const hasDescription = currentDescription && currentDescription.trim().length > 0;
        const hasTitle = currentTitle && currentTitle.trim().length > 0;

        if (!force && hasDescription && (titles ? hasTitle : true)) {
          console.log(
            `  ⏭️  Skipped ${targetLocale}: Already has ${hasDescription ? 'description' : ''} ${hasTitle && titles ? 'and title' : ''}`
          );
          continue;
        }

        // Generate alt-text for this locale
        if (!hasDescription || force) {
          console.log(
            `  🤖 Generating alt-text (${targetLocale})...${context ? ` (Context: ${context})` : ''}`
          );

          const altText = await generateAltText(imageUrl, targetLocale, context || undefined);

          if (altText && altText.trim().length > 0) {
            console.log(`  ✨ Generated alt-text (${targetLocale}): "${altText}"`);

            const updated = await updateAssetDescription(
              env,
              assetToUpdate,
              altText,
              targetLocale,
              dryRun || false
            );
            if (updated) {
              anyUpdateSuccess = true;
              // Re-fetch to get latest state for next locale
              assetToUpdate = await env.getAsset(assetId);
            }
          } else {
            console.log(`  ⚠️  Skipped ${targetLocale}: Empty alt-text generated`);
          }
        }

        // Generate title for this locale if requested
        if (titles && (!hasTitle || force)) {
          try {
            console.log(`  📝 Generating title (${targetLocale})...`);
            const generatedTitle = await generateAssetTitle(
              imageUrl,
              fileName,
              targetLocale,
              context || undefined
            );
            console.log(`  ✨ Generated title (${targetLocale}): "${generatedTitle}"`);

            const titleUpdated = await updateAssetTitle(
              env,
              assetToUpdate,
              generatedTitle,
              targetLocale,
              dryRun || false
            );
            if (titleUpdated) {
              anyUpdateSuccess = true;
              // Re-fetch to get latest state for next locale
              assetToUpdate = await env.getAsset(assetId);
            }
          } catch (titleError: any) {
            console.error(
              `  ⚠️  Title generation failed for ${targetLocale}: ${titleError.message}`
            );
            // Continue with other locales even if this one fails
          }
        }

        // Small delay between locales
        if (targetLocale !== targetLocales[targetLocales.length - 1]) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (anyUpdateSuccess) {
        console.log(`  ✅ ${dryRun ? 'Would update' : 'Updated'} successfully`);
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
      errorCount++;
    }

    // Rate limiting: wait a bit between requests
    if (i < assetsToProcess.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    }

    console.log('');
  }

  // Summary
  console.log('');
  console.log('📊 Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ⏭️  Skipped: ${skippedCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📦 Total: ${assetsToProcess.length}`);

  if (dryRun) {
    console.log('');
    console.log('ℹ️  This was a DRY RUN. No changes were made to Contentful.');
    console.log('   Run without --dryRun to actually update assets.');
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
