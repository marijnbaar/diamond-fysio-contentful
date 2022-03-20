import gql from 'graphql-tag';

const queryHomePage = gql`
  query homepageCollectionQuery {
    homepageCollection(limit: 1) {
      items {
        title
        componentsCollection {
          items {
            ... on HeaderHomepage {
              sys {
                id
              }
              title {
                json
              }
              info {
                json
              }
            }
          }
        }
      }
    }
  }
`;

export default queryHomePage;
