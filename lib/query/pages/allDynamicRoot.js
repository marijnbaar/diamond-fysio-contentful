import gql from 'graphql-tag';

const queryAllPages = gql`
  query {
    homepageCollection(limit: 1) {
      items {
        slug
        __typename
      }
    }
    teampageCollection(limit: 2) {
      items {
        slug
        __typename
      }
    }
    specialisationpageCollection(limit: 10) {
      items {
        slug
        __typename
      }
    }
  }
`;
export default queryAllPages;
