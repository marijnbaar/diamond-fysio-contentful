import ComponentList from '../components/ComponentList';
import { getPage } from '../lib/query/getData';
import queryAllPages from '../lib/query/pages/allDynamicRoot';
import { getTypeName } from '../lib/query/getData';
import { normalizeLocale } from '../lib/helpers/normalizeLocale';
import { loadPosts } from './api/fetchPosts';

const Page = (pageProps) => {
  switch (pageProps.__typename) {
    default:
      return (
        <>
          <ComponentList
            components={pageProps.components}
            instagramPosts={pageProps.instagramPosts}
          />
        </>
      );
  }
};

export const getServerSideProps = async ({ params, preview = false, locale = 'nl' }) => {
  const slug = Array.isArray(params?.slug) ? `/${params.slug.join('/')}` : '/';
  const modelId = await getTypeName(slug, preview, queryAllPages);
  if (!modelId) {
    return { notFound: true };
  }
  const cfLocale = normalizeLocale(locale) || undefined;
  const translated = (await getPage(modelId, slug, preview, cfLocale)) ?? [];
  const instagramPosts = await loadPosts();

  return {
    props: {
      ...translated,
      preview: preview,
      instagramPosts,
      slug: slug,
      // Extract meta if it exists in the page data
      meta: translated.meta || translated.meta_data || null
    }
  };
};

export default Page;
