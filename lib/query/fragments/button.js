import gql from 'graphql-tag';

const fragmentButton = gql`
  fragment button on Button {
    title
    internalLink {
      ... on Specialisationpage {
        slug
        __typename
        sys {
          id
        }
      }
      ... on Homepage {
        slug
        __typename
        sys {
          id
        }
      }
      ... on Pricingpage {
        slug
        __typename
        sys {
          id
        }
      }
      ... on Houserulespage {
        slug
        __typename
        sys {
          id
        }
      }
    }
    externalLink
    type
  }
`;

export default fragmentButton;
