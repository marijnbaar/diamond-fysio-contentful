import gql from 'graphql-tag';
import fragmentButton from '../fragments/button';

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
      image {
        url
      }
      buttonCollection {
        items {
          ...button
        }
      }
    }
  }
  ${fragmentButton}
`;

export default queryHeaderHomepage;
