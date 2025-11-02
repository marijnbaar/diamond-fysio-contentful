import gql from 'graphql-tag';

const querySpecialisation = gql`
  query specialisation($id: String!, $locale: String) {
    specialisation(id: $id, locale: $locale) {
      sys {
        id
      }
      image {
        url
      }
      title
      subtitle
      description {
        json
      }
    }
  }
`;

export default querySpecialisation;
