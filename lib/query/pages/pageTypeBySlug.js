import gql from 'graphql-tag';

const queryPageTypeBySlug = gql`
  query pageTypeBySlug($slug: String!) {
    homepageCollection(where: { slug: $slug }, limit: 1) {
      items {
        __typename
        slug
      }
    }
    aboutpageCollection(where: { slug: $slug }, limit: 1) {
      items {
        __typename
        slug
        pageType
      }
    }
  }
`;
export default queryPageTypeBySlug;
