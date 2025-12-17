import { getPage } from '../lib/query/getData';
import ComponentList from '../components/ComponentList';
import { loadPosts } from '../lib/api/fetchPosts';
// runtime translation removed; we fetch localized content directly from Contentful
// removed legacy runtime i18n fetches; we use Contentful locales only
import { normalizeLocale } from '../lib/helpers/normalizeLocale';

export const getStaticProps = async ({ preview = false, locale = 'nl' }) => {
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
    },
    revalidate: 86400
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
