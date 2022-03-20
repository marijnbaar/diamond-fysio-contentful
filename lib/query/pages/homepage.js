import gql from 'graphql-tag';

const queryHomePage = gql`
  query homepageCollectionQuery {
    homepageCollection(limit: 1) {
      items {
        title
      }
    }
  }
`;

export default queryHomePage;
