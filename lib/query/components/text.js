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
      longDescription {
        json
      }
    }
  }
`;

export default queryText;
