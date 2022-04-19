import gql from 'graphql-tag';

const queryInfo = gql`
  query info($id: String!) {
    info(id: $id) {
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
