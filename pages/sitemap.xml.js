import { getServerSideSitemap } from 'next-sitemap';
import { getClient } from '../lib/query/getQuery';

export const getServerSideProps = async (ctx) => {
  const client = getClient();

  // Fetch all your dynamic routes here
  const pages = await client.fetch(`*[_type in ["page", "post"]] {
    slug,
    _updatedAt
  }`);

  const fields = pages.map((page) => ({
    loc: `https://www.fysiodiamondfactory.nl/${page.slug.current}`,
    lastmod: page._updatedAt
  }));

  return getServerSideSitemap(ctx, fields);
};

// Default export to prevent next.js errors
export default function Sitemap() {}
