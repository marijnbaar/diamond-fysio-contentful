import gql from 'graphql-tag';

const queryCookiecomponent = gql`
  query cookieComponent($id: String!) {
    cookieComponent(id: $id) {
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

export default queryCookiecomponent;
