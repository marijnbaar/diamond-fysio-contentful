import gql from 'graphql-tag';

const queryText = gql`
  query text($id: String!) {
    text(id: $id) {
      sys {
        id
      }
      title
      description {
        json
      }
      subtitle
    }
  }
`;

export default queryText;
