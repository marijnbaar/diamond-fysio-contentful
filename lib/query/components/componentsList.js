import gql from 'graphql-tag';

const fragmentComponentList = (model) => gql`
  fragment componentList${model} on ${model}ComponentsCollection {
    items {
      ... on HeaderHomepage {
        sys {
          id
        }
        __typename
      }
    }
  }
`;

export default fragmentComponentList;
