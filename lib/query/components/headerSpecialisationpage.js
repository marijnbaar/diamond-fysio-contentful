import gql from 'graphql-tag';

const queryHeaderSpecialisationpage = gql`
  query headerSpecialisationpage($id: String!) {
    headerSpecialisationpage(id: $id) {
      sys {
        id
      }
      title
      description
      image {
        url
      }
    }
  }
`;

export default queryHeaderSpecialisationpage;
