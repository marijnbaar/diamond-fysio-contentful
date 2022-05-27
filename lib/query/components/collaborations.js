import gql from 'graphql-tag';

const queryCollaborations = gql`
  query collaborations($id: String!) {
    collaborations(id: $id) {
      sys {
        id
      }
      title
      logoCollection {
        items {
          url
        }
      }
    }
  }
`;

export default queryCollaborations;
