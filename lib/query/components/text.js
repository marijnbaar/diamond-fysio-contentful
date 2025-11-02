import gql from 'graphql-tag';

const queryText = gql`
  query text($id: String!, $locale: String) {
    text(id: $id, locale: $locale) {
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
