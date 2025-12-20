const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// === CONFIGURATIE ===
const SITE_URL = 'https://www.fysiodiamondfactory.nl';
const FALLBACK_DIR = path.join(__dirname, '..', 'lib', 'fallback');
const DELAY_MS = 1500; // Vertraging tussen pagina's

// === HELPERS ===
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function slugToKey(slug) {
  if (slug === '/' || slug === '') return 'homepage';
  return slug.replace(/^\//, '').replace(/\//g, '-').replace(/^en-/, 'en/');
}

// === MAIN ===
async function main() {
  console.log('🚀 Starting Puppeteer site export...\n');

  // Create fallback directory
  if (!fs.existsSync(FALLBACK_DIR)) {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true });
  }

  // Launch browser
  console.log('📍 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080'
    ]
  });

  const page = await browser.newPage();

  // Set realistic viewport and user agent
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Set extra headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7'
  });

  // Collect all URLs - start with homepage
  const allUrls = new Set(['/']);
  const visited = new Set();
  const exportedPages = {};
  const errors = [];
  let sharedNavigation = null;
  let sharedFooter = null;

  // First, visit homepage to pass any challenge and get links
  console.log('\n📍 Step 1: Visiting homepage to discover pages...');

  try {
    await page.goto(`${SITE_URL}/`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait a bit for any JS challenges
    await sleep(3000);

    // Extract all internal links
    const links = await page.evaluate((baseUrl) => {
      const anchors = document.querySelectorAll('a[href]');
      const links = new Set();
      anchors.forEach((a) => {
        let href = a.getAttribute('href');
        if (!href) return;

        // Skip external, anchors, assets
        if (href.startsWith('http') && !href.startsWith(baseUrl)) return;
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (href.match(/\.(jpg|jpeg|png|gif|svg|css|js|pdf|ico)$/i)) return;

        // Normalize
        if (href.startsWith('/')) {
          links.add(href.split('?')[0].split('#')[0]);
        } else if (!href.startsWith('http')) {
          // Relative link
          links.add('/' + href.split('?')[0].split('#')[0]);
        }
      });
      return Array.from(links);
    }, SITE_URL);

    links.forEach((link) => allUrls.add(link));
    console.log(`✓ Found ${allUrls.size} unique URLs from homepage`);
  } catch (error) {
    console.error(`❌ Failed to load homepage: ${error.message}`);
    await browser.close();
    return;
  }

  // 2. Export each page
  console.log('\n📍 Step 2: Exporting page data...\n');

  for (const pagePath of allUrls) {
    if (visited.has(pagePath)) continue;
    visited.add(pagePath);

    const url = `${SITE_URL}${pagePath}`;
    process.stdout.write(`Fetching ${pagePath}... `);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for any dynamic content
      await sleep(1000);

      // Extract __NEXT_DATA__
      const pageData = await page.evaluate(() => {
        const script = document.getElementById('__NEXT_DATA__');
        if (!script) return null;
        try {
          const data = JSON.parse(script.textContent);
          return data.props?.pageProps || null;
        } catch {
          return null;
        }
      });

      if (!pageData) {
        console.log('⚠ No data');
        continue;
      }

      const key = slugToKey(pagePath);

      // Store navigation/footer once
      if (!sharedNavigation && pageData.navigation) {
        sharedNavigation = pageData.navigation;
      }
      if (!sharedFooter && pageData.footer) {
        sharedFooter = pageData.footer;
      }

      exportedPages[key] = pageData;

      // Save individual file
      fs.writeFileSync(
        path.join(FALLBACK_DIR, `${key.replace(/\//g, '-')}.json`),
        JSON.stringify(pageData, null, 2)
      );

      console.log('✓');

      // Also extract any new links from this page
      const newLinks = await page.evaluate((baseUrl) => {
        const anchors = document.querySelectorAll('a[href]');
        const links = new Set();
        anchors.forEach((a) => {
          let href = a.getAttribute('href');
          if (!href) return;
          if (href.startsWith('http') && !href.startsWith(baseUrl)) return;
          if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
          if (href.match(/\.(jpg|jpeg|png|gif|svg|css|js|pdf|ico)$/i)) return;
          if (href.startsWith('/')) {
            links.add(href.split('?')[0].split('#')[0]);
          }
        });
        return Array.from(links);
      }, SITE_URL);

      newLinks.forEach((link) => {
        if (!visited.has(link)) {
          allUrls.add(link);
        }
      });
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      errors.push(pagePath);
    }

    await sleep(DELAY_MS);
  }

  // Close browser
  await browser.close();

  // 3. Save combined files
  console.log('\n📍 Step 3: Saving combined data...');

  // All pages combined
  fs.writeFileSync(
    path.join(FALLBACK_DIR, 'all-pages.json'),
    JSON.stringify(exportedPages, null, 2)
  );

  // Shared navigation
  if (sharedNavigation) {
    fs.writeFileSync(
      path.join(FALLBACK_DIR, 'navigation.json'),
      JSON.stringify(sharedNavigation, null, 2)
    );
  }

  // Shared footer
  if (sharedFooter) {
    fs.writeFileSync(path.join(FALLBACK_DIR, 'footer.json'), JSON.stringify(sharedFooter, null, 2));
  }

  // Index file
  const index = {
    exportedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    totalPages: Object.keys(exportedPages).length,
    pages: Object.keys(exportedPages),
    errors: errors
  };
  fs.writeFileSync(path.join(FALLBACK_DIR, 'index.json'), JSON.stringify(index, null, 2));

  // 4. Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ EXPORT COMPLETE');
  console.log('='.repeat(50));
  console.log(`📁 Files saved to: ${FALLBACK_DIR}`);
  console.log(`📄 Pages exported: ${Object.keys(exportedPages).length}`);
  if (errors.length > 0) {
    console.log(`⚠️  Failed pages: ${errors.join(', ')}`);
  }
  console.log('\nNext step: Run your build with SKIP_CONTENTFUL=true');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
