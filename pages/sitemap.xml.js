import { getServerSideSitemap } from 'next-sitemap';
import getClient from '../lib/contentful.js';
import queryAllPages from '../lib/query/pages/allDynamicRoot';

export const getServerSideProps = async (ctx) => {
  const client = getClient(false); // false = not preview mode
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fysiodiamondfactory.nl';

  const fields = [];

  try {
    // Fetch all pages from Contentful
    const { data } = await client.query({
      query: queryAllPages
    });

    // Process homepage
    if (data.homepageCollection?.items) {
      data.homepageCollection.items.forEach((page) => {
        const slug = page.slug || '/';
        fields.push({
          loc: `${siteUrl}${slug === '/' ? '' : slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 1.0
        });
        // Add English version
        fields.push({
          loc: `${siteUrl}/en${slug === '/' ? '' : slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 1.0
        });
      });
    }

    // Process about pages
    if (data.aboutpageCollection?.items) {
      data.aboutpageCollection.items.forEach((page) => {
        if (page.slug) {
          fields.push({
            loc: `${siteUrl}${page.slug}`,
            lastmod: new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.8
          });
          // Add English version
          fields.push({
            loc: `${siteUrl}/en${page.slug}`,
            lastmod: new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.8
          });
        }
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return getServerSideSitemap(ctx, fields);
};

// Default export to prevent next.js errors
export default function Sitemap() {}
