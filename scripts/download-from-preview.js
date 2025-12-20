const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

// === CONFIGURATIE ===
// Preview deployment die nog werkende images heeft
const PREVIEW_URL = 'https://diamond-fysio-contentful-k65ok9o0h-marijnbaars-projects.vercel.app';
const FALLBACK_DIR = path.join(__dirname, '..', 'lib', 'fallback');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'fallback');
const ALL_PAGES_FILE = path.join(FALLBACK_DIR, 'all-pages.json');

// === HELPERS ===
function extractImageUrls(obj, urls = new Set()) {
  if (!obj) return urls;

  if (typeof obj === 'string') {
    if (obj.includes('images.ctfassets.net') || obj.includes('ctfassets.net')) {
      urls.add(obj.split('?')[0]);
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
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  const assetId = pathParts[3] || 'unknown';
  const filename = pathParts[pathParts.length - 1] || 'image.jpg';
  return `${assetId}-${filename}`;
}

function replaceUrlsInObject(obj, urlMap) {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    const baseUrl = obj.split('?')[0];
    if (urlMap.has(baseUrl)) {
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

// Download image via Next.js image optimization endpoint on preview
async function downloadViaPreview(browser, contentfulUrl, localPath) {
  const page = await browser.newPage();

  try {
    // Use the preview's _next/image endpoint to get the optimized image
    const encodedUrl = encodeURIComponent(contentfulUrl);
    const previewImageUrl = `${PREVIEW_URL}/_next/image?url=${encodedUrl}&w=1920&q=80`;

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    const response = await page.goto(previewImageUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    if (response && response.status() === 200) {
      const buffer = await response.buffer();
      fs.writeFileSync(localPath, buffer);
      await page.close();
      return true;
    }

    await page.close();
    return false;
  } catch (error) {
    await page.close();
    return false;
  }
}

// Direct download for images that might work
async function downloadDirect(url, localPath) {
  return new Promise((resolve) => {
    const request = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      },
      (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          downloadDirect(response.headers.location, localPath).then(resolve);
          return;
        }

        if (response.statusCode !== 200) {
          resolve(false);
          return;
        }

        const fileStream = fs.createWriteStream(localPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });

        fileStream.on('error', () => resolve(false));
      }
    );

    request.on('error', () => resolve(false));
    request.setTimeout(15000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

// === MAIN ===
async function main() {
  console.log('🖼️  Downloading images from preview deployment...\n');
  console.log(`Preview URL: ${PREVIEW_URL}\n`);

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

  // Launch browser
  console.log('📍 Step 3: Downloading images via preview deployment...\n');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const urlMap = new Map();
  let downloaded = 0;
  let failed = 0;

  for (const url of imageUrls) {
    const localFilename = urlToLocalPath(url);
    const localPath = path.join(IMAGES_DIR, localFilename);
    const publicPath = `/images/fallback/${localFilename}`;

    process.stdout.write(`${localFilename}... `);

    // Skip if already downloaded
    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
      console.log('⏭️  exists');
      urlMap.set(url, publicPath);
      downloaded++;
      continue;
    }

    // Try via preview deployment first
    let success = await downloadViaPreview(browser, url, localPath);

    // If that fails, try direct download
    if (!success) {
      success = await downloadDirect(url, localPath);
    }

    if (success && fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
      console.log('✓');
      urlMap.set(url, publicPath);
      downloaded++;
    } else {
      console.log('❌');
      failed++;
      // Clean up empty file if it was created
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
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
  console.log('✅ DOWNLOAD COMPLETE');
  console.log('='.repeat(50));
  console.log(`📁 Images saved to: ${IMAGES_DIR}`);
  console.log(`✓ Downloaded: ${downloaded}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log('\nFallback data updated with local image paths.');
  console.log('\nNext: git add, commit, and push to deploy with local images.');
}

main().catch(console.error);
