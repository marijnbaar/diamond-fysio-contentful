import ComponentList from '../components/ComponentList';
import { getPageSlugs } from '../lib/query/getData';
import { getPage } from '../lib/query/getData';
import queryAllPages from '../lib/query/pages/allDynamicRoot';
import { getTypeName } from '../lib/query/getData';

const Page = (pageProps) => {
  switch (pageProps.__typename) {
    default:
      return (
        <>
          <ComponentList components={pageProps.components} />
        </>
      );
  }
};

export const getStaticProps = async ({ params, preview = false }) => {
  const slug = `/${params.slug.join('/')}`;
  const modelId = await getTypeName(slug, preview, queryAllPages);
  const pageData = (await getPage(modelId, slug, preview)) ?? [];
  console.log('j', pageData);
  return {
    props: {
      ...pageData,
      preview: preview
    }
  };
};

export const getStaticPaths = async () => {
  const pagePaths = (await getPageSlugs(queryAllPages)) ?? [];
  return {
    paths: pagePaths,
    fallback: false
  };
};

export default Page;
