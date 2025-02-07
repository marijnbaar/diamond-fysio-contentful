import gql from 'graphql-tag';

const fragmentButton = gql`
  fragment button on Button {
    title
    internalLink {
      ... on Homepage {
        slug
        __typename
        sys {
          id
        }
      }
      ... on Aboutpage {
        slug
        pageType
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
