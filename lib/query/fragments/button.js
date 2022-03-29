import gql from 'graphql-tag';

const fragmentButton = gql`
  fragment button on Button {
    title
    internalLink {
      __typename
      sys {
        id
      }
    }
    externalLink
    type
  }
`;

export default fragmentButton;
