import gql from 'graphql-tag';

const queryHighlight = gql`
  query highlight($id: String!, $locale: String) {
    highlight(id: $id, locale: $locale) {
      sys {
        id
      }
      info
    }
  }
`;

export default queryHighlight;
