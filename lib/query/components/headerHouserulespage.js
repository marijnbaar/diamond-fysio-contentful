import gql from 'graphql-tag';

const queryHeaderHouserulespage = gql`
  query headerHouserulespage($id: String!) {
    headerHouserulespage(id: $id) {
      sys {
        id
      }
      image {
        url
      }
    }
  }
`;

export default queryHeaderHouserulespage;
