import { getPage } from '../lib/query/getData';
import ComponentList from '../components/ComponentList';
import { loadPosts } from './api/fetchPosts';
// runtime translation removed; we fetch localized content directly from Contentful
// removed legacy runtime i18n fetches; we use Contentful locales only
import { normalizeLocale } from '../lib/helpers/normalizeLocale';

export const getServerSideProps = async ({ preview = false, locale = 'nl' }) => {
  const cfLocale = normalizeLocale(locale) || undefined;
  const pageData = (await getPage('Homepage', undefined, preview, cfLocale)) ?? [];
  const instagramPosts = await loadPosts();

  const translated = pageData;

  return {
    props: {
      ...translated,
      instagramPosts,
      preview
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
