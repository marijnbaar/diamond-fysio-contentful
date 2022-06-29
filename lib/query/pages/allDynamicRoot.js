import gql from 'graphql-tag';

const queryAllPages = gql`
  query {
    appointmentpageCollection(limit: 1) {
      items {
        slug
        __typename
      }
    }
    homepageCollection(limit: 1) {
      items {
        slug
        __typename
      }
    }
    teampageCollection(limit: 1) {
      items {
        slug
        __typename
      }
    }
    pricingpageCollection(limit: 1) {
      items {
        slug
        __typename
      }
    }
    houserulespageCollection(limit: 1) {
      items {
        slug
        __typename
      }
    }
    aboutpageCollection(limit: 1) {
      items {
        slug
        __typename
      }
    }
    specialisationpageCollection(limit: 15) {
      items {
        sys {
          id
        }
        slug
        __typename
      }
    }
  }
`;
export default queryAllPages;
