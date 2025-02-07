import gql from 'graphql-tag';

const queryAllPages = gql`
  query {
    homepageCollection(limit: 1) {
      items {
        slug
        __typename
      }
    }
    aboutpageCollection(limit: 25) {
      items {
        slug
        __typename
      }
    }
  }
`;
export default queryAllPages;
