const fs = require('fs');
const path = require('path');

// === CONFIGURATIE ===
const SITE_URL = 'https://www.fysiodiamondfactory.nl';
const FALLBACK_DIR = path.join(__dirname, '..', 'lib', 'fallback');
const MAX_RETRIES = 3;
const DELAY_MS = 500; // Vertraging tussen requests

// === HELPERS ===
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"macOS"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      console.warn(`  Attempt ${i + 1}/${retries} failed for ${url}: ${error.message}`);
      if (i < retries - 1) await sleep(2000 * (i + 1)); // Longer delays
    }
  }
  return null;
}

function extractNextData(html) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    let href = match[1];
    // Skip external, anchors, assets
    if (href.startsWith('http') && !href.startsWith(baseUrl)) continue;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.match(/\.(jpg|jpeg|png|gif|svg|css|js|pdf|ico)$/i)) continue;

    // Normalize
    if (href.startsWith('/')) {
      links.add(href.split('?')[0].split('#')[0]);
    }
  }
  return links;
}

async function parseSitemap(sitemapUrl) {
  const urls = new Set();
  try {
    const xml = await fetchWithRetry(sitemapUrl);
    if (!xml) return urls;

    const locRegex = /<loc>([^<]+)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(xml)) !== null) {
      const url = new URL(match[1]);
      urls.add(url.pathname || '/');
    }
    console.log(`✓ Found ${urls.size} URLs in sitemap`);
  } catch (error) {
    console.warn(`⚠ Could not parse sitemap: ${error.message}`);
  }
  return urls;
}

function slugToKey(slug) {
  if (slug === '/' || slug === '') return 'homepage';
  return slug.replace(/^\//, '').replace(/\//g, '-').replace(/^en-/, 'en/');
}

// === MAIN ===
async function main() {
  console.log('🚀 Starting foolproof site export...\n');

  // Create fallback directory
  if (!fs.existsSync(FALLBACK_DIR)) {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true });
  }

  // Collect all URLs
  const allUrls = new Set(['/']);

  // 1. Try sitemap first
  console.log('📍 Step 1: Parsing sitemap...');
  const sitemapUrls = await parseSitemap(`${SITE_URL}/sitemap.xml`);
  sitemapUrls.forEach((url) => allUrls.add(url));

  // 2. Crawl from homepage to discover more
  console.log('\n📍 Step 2: Crawling site for additional pages...');
  const visited = new Set();
  const toVisit = ['/'];

  while (toVisit.length > 0 && visited.size < 100) {
    // Max 100 pages safety
    const currentPath = toVisit.shift();
    if (visited.has(currentPath)) continue;
    visited.add(currentPath);

    const url = `${SITE_URL}${currentPath}`;
    const html = await fetchWithRetry(url);

    if (html) {
      const links = extractLinks(html, SITE_URL);
      links.forEach((link) => {
        if (!visited.has(link) && !toVisit.includes(link)) {
          toVisit.push(link);
          allUrls.add(link);
        }
      });
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n✓ Total unique URLs found: ${allUrls.size}`);

  // 3. Export each page
  console.log('\n📍 Step 3: Exporting page data...\n');

  const exportedPages = {};
  const errors = [];
  let sharedNavigation = null;
  let sharedFooter = null;

  for (const pagePath of allUrls) {
    const url = `${SITE_URL}${pagePath}`;
    process.stdout.write(`Fetching ${pagePath}... `);

    const html = await fetchWithRetry(url);
    if (!html) {
      console.log('❌ Failed');
      errors.push(pagePath);
      continue;
    }

    const nextData = extractNextData(html);
    if (!nextData?.props?.pageProps) {
      console.log('⚠ No data');
      continue;
    }

    const pageProps = nextData.props.pageProps;
    const key = slugToKey(pagePath);

    // Store navigation/footer once
    if (!sharedNavigation && pageProps.navigation) {
      sharedNavigation = pageProps.navigation;
    }
    if (!sharedFooter && pageProps.footer) {
      sharedFooter = pageProps.footer;
    }

    exportedPages[key] = pageProps;

    // Save individual file
    fs.writeFileSync(
      path.join(FALLBACK_DIR, `${key.replace(/\//g, '-')}.json`),
      JSON.stringify(pageProps, null, 2)
    );

    console.log('✓');
    await sleep(DELAY_MS);
  }

  // 4. Save combined files
  console.log('\n📍 Step 4: Saving combined data...');

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

  // 5. Summary
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

main().catch(console.error);
