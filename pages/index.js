import ComponentList from '../components/ComponentList';
import { getPage } from '../lib/query/getData';
import { loadPosts } from '../lib/api/fetchPosts';
import { normalizeLocale } from '../lib/helpers/normalizeLocale';

export const getStaticProps = async ({ preview = false, locale = 'nl' }) => {
  const cfLocale = normalizeLocale(locale) || undefined;
  // Try to fetch homepage with slug '/'
  const pageData = (await getPage('Homepage', '/', preview, cfLocale)) ?? {};
  const instagramPosts = await loadPosts();

  if (pageData.notFound) {
    console.error('Homepage not found with slug "/"');
    return {
      notFound: true,
      revalidate: 86400
    };
  }

  const translated = pageData;
  const components = Array.isArray(translated?.components) ? translated.components : [];

  return {
    props: {
      ...translated,
      components, // Always provide an array to ComponentList
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
  if (!props.components) {
    return <div>Loading... or No Components Found</div>;
  }
  return (
    <div>
      <ComponentList components={props.components} instagramPosts={props.instagramPosts} />
    </div>
  );
};

export default Home;
