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
    // For 404, we need to ensure Next.js uses our custom 404 page
    // Return 404 status but don't pass props - Next.js will render 404.js
    return {
      notFound: true
      // Don't pass props here, Next.js will handle the 404 rendering
    };
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
