import ComponentList from '../../components/ComponentList';
import { getPageSlugs } from '../../lib/query/getData';
import { getPage } from '../../lib/query/getData';
import gql from 'graphql-tag';

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
  const slug = `/specialisatie/${params.slug}`;
  const pageData = (await getPage(`Specialisationpage`, slug, preview)) ?? [];
  return {
    props: {
      ...pageData,
      preview: preview
    }
  };
};

export const getStaticPaths = async () => {
  const querySlugs = gql`
    query {
      specialisationpageCollection(limit: 100) {
        items {
          slug
          __typename
        }
      }
    }
  `;

  const pagePaths = (await getPageSlugs(querySlugs, '')) ?? [];
  console.log('test', pagePaths);
  return {
    paths: pagePaths,
    fallback: false
  };
};

export default Page;
