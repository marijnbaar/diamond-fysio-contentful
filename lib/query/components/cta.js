import gql from 'graphql-tag';
import fragmentButton from '../fragments/button';

const queryCta = gql`
  query cta($id: String!) {
    cta(id: $id) {
      sys {
        id
      }
      title
      subtitle
      description
      button {
        ...button
      }
      image {
        url
      }
    }
  }
  ${fragmentButton}
`;

export default queryCta;
