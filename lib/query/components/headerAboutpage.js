import gql from 'graphql-tag';

const queryHeaderAboutpage = gql`
  query headerAboutpage($id: String!) {
    headerAboutpage(id: $id) {
      sys {
        id
      }
      image {
        url
      }
    }
  }
`;

export default queryHeaderAboutpage;
