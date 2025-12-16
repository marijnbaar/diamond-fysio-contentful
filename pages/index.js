import { getPage } from '../lib/query/getData';
import ComponentList from '../components/ComponentList';
import { loadPosts } from './api/fetchPosts';
// runtime translation removed; we fetch localized content directly from Contentful
// removed legacy runtime i18n fetches; we use Contentful locales only
import { normalizeLocale } from '../lib/helpers/normalizeLocale';

export const getServerSideProps = async ({ preview = false, locale = 'nl', res }) => {
  // Add Cache-Control header to response for 1 hour cache
  if (res) {
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }

  const cfLocale = normalizeLocale(locale) || undefined;
  const pageData = (await getPage('Homepage', undefined, preview, cfLocale)) ?? [];
  const instagramPosts = await loadPosts();

  const translated = pageData;

  return {
    props: {
      ...translated,
      instagramPosts,
      preview,
      slug: '/',
      // Extract meta if it exists in the page data
      meta: translated.meta || translated.meta_data || null
    }
  };
};

const Home = (props) => {
  return (
    <div>
      <ComponentList components={props.components} instagramPosts={props.instagramPosts} />
    </div>
  );
};

export default Home;
