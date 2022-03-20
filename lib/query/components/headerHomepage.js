import gql from 'graphql-tag';

const queryHeaderHomepage = gql`
  query headerHomepage($id: String!) {
    headerHomepage(id: $id) {
      sys {
        id
      }
      title {
        json
      }
      info {
        json
      }
    }
  }
`;

export default queryHeaderHomepage;
