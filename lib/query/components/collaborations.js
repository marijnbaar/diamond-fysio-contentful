import gql from 'graphql-tag';

const queryCollaborations = gql`
  query collaborations($id: String!, $locale: String) {
    collaborations(id: $id, locale: $locale) {
      sys {
        id
      }
      title
      logoCollection(locale: $locale) {
        items {
          url
        }
      }
    }
  }
`;

export default queryCollaborations;
