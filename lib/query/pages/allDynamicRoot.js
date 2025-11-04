import gql from 'graphql-tag';

const queryAllPages = gql`
  query {
    homepageCollection(limit: 1) {
      items {
        slug
        __typename
      }
    }
    aboutpageCollection(limit: 100) {
      items {
        slug
        pageType
        __typename
      }
    }
  }
`;
export default queryAllPages;
