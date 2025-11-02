import gql from 'graphql-tag';

const queryInfo = gql`
  query info($id: String!, $locale: String) {
    info(id: $id, locale: $locale) {
      sys {
        id
      }
      title
      subtitle
      description {
        json
      }
      image {
        url
      }
    }
  }
`;

export default queryInfo;
