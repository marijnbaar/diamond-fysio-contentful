const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// === CONFIGURATIE ===
const FALLBACK_DIR = path.join(__dirname, '..', 'lib', 'fallback');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'fallback');
const ALL_PAGES_FILE = path.join(FALLBACK_DIR, 'all-pages.json');

// === HELPERS ===
function extractImageUrls(obj, urls = new Set()) {
  if (!obj) return urls;

  if (typeof obj === 'string') {
    // Check if it's a Contentful image URL
    if (obj.includes('images.ctfassets.net') || obj.includes('ctfassets.net')) {
      urls.add(obj.split('?')[0]); // Remove query params for base URL
    }
    return urls;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => extractImageUrls(item, urls));
    return urls;
  }

  if (typeof obj === 'object') {
    Object.values(obj).forEach((value) => extractImageUrls(value, urls));
  }

  return urls;
}

function urlToLocalPath(url) {
  // Extract filename from URL
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  // Use the asset ID and filename to create a unique local path
  // Format: /v1/spaces/SPACE_ID/ASSET_ID/HASH/filename.ext
  const assetId = pathParts[3] || 'unknown';
  const filename = pathParts[pathParts.length - 1] || 'image.jpg';
  return `${assetId}-${filename}`;
}

async function downloadImage(url, localPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      },
      (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          downloadImage(response.headers.location, localPath).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(localPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });

        fileStream.on('error', reject);
      }
    );

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function downloadWithPuppeteer(url, localPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const buffer = await response.buffer();
    fs.writeFileSync(localPath, buffer);
    return true;
  } catch (error) {
    return false;
  } finally {
    await browser.close();
  }
}

function replaceUrlsInObject(obj, urlMap) {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    const baseUrl = obj.split('?')[0];
    if (urlMap.has(baseUrl)) {
      // Keep query params if they exist
      return urlMap.get(baseUrl);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => replaceUrlsInObject(item, urlMap));
  }

  if (typeof obj === 'object') {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = replaceUrlsInObject(value, urlMap);
    }
    return newObj;
  }

  return obj;
}

// === MAIN ===
async function main() {
  console.log('🖼️  Starting image download...\n');

  // Create images directory
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Load fallback data
  console.log('📍 Step 1: Loading fallback data...');
  const allPages = JSON.parse(fs.readFileSync(ALL_PAGES_FILE, 'utf8'));

  // Extract all image URLs
  console.log('📍 Step 2: Extracting image URLs...');
  const imageUrls = extractImageUrls(allPages);
  console.log(`✓ Found ${imageUrls.size} unique images\n`);

  // Download images
  console.log('📍 Step 3: Downloading images...\n');
  const urlMap = new Map();
  let downloaded = 0;
  let failed = 0;

  // Try to use Puppeteer for downloads (to bypass rate limiting)
  console.log('Launching browser for downloads...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const url of imageUrls) {
    const localFilename = urlToLocalPath(url);
    const localPath = path.join(IMAGES_DIR, localFilename);
    const publicPath = `/images/fallback/${localFilename}`;

    process.stdout.write(`Downloading ${localFilename}... `);

    // Skip if already downloaded
    if (fs.existsSync(localPath)) {
      console.log('⏭️  Exists');
      urlMap.set(url, publicPath);
      downloaded++;
      continue;
    }

    try {
      // Try with Puppeteer
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

      const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      if (response.status() === 200) {
        const buffer = await response.buffer();
        fs.writeFileSync(localPath, buffer);
        urlMap.set(url, publicPath);
        console.log('✓');
        downloaded++;
      } else {
        console.log(`❌ HTTP ${response.status()}`);
        failed++;
      }

      await page.close();
    } catch (error) {
      console.log(`❌ ${error.message}`);
      failed++;
    }
  }

  await browser.close();

  // Update fallback data with local paths
  console.log('\n📍 Step 4: Updating fallback data with local paths...');
  const updatedPages = replaceUrlsInObject(allPages, urlMap);

  // Save updated data
  fs.writeFileSync(ALL_PAGES_FILE, JSON.stringify(updatedPages, null, 2));

  // Also update individual page files
  for (const [key, pageData] of Object.entries(updatedPages)) {
    const filename = `${key.replace(/\//g, '-')}.json`;
    const filepath = path.join(FALLBACK_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, JSON.stringify(pageData, null, 2));
    }
  }

  // Update navigation and footer
  const navPath = path.join(FALLBACK_DIR, 'navigation.json');
  const footerPath = path.join(FALLBACK_DIR, 'footer.json');

  if (fs.existsSync(navPath)) {
    const nav = JSON.parse(fs.readFileSync(navPath, 'utf8'));
    fs.writeFileSync(navPath, JSON.stringify(replaceUrlsInObject(nav, urlMap), null, 2));
  }

  if (fs.existsSync(footerPath)) {
    const footer = JSON.parse(fs.readFileSync(footerPath, 'utf8'));
    fs.writeFileSync(footerPath, JSON.stringify(replaceUrlsInObject(footer, urlMap), null, 2));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ IMAGE DOWNLOAD COMPLETE');
  console.log('='.repeat(50));
  console.log(`📁 Images saved to: ${IMAGES_DIR}`);
  console.log(`✓ Downloaded: ${downloaded}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log('\nFallback data has been updated with local image paths.');
}

main().catch(console.error);
