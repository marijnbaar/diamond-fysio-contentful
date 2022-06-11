import gql from 'graphql-tag';

const querySpecialisation = gql`
  query specialisation($id: String!) {
    specialisation(id: $id) {
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
