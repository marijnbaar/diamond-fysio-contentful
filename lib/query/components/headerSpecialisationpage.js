import gql from 'graphql-tag';

const queryHeaderSpecialisationpage = gql`
  query headerSpecialisationpage($id: String!) {
    headerSpecialisationpage(id: $id) {
      sys {
        id
      }
      title
      descriptionRichText {
        json
      }
      image {
        url
      }
    }
  }
`;

export default queryHeaderSpecialisationpage;
