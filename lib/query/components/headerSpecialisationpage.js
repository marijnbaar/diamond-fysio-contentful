import gql from 'graphql-tag';

const queryHeaderSpecialisationpage = gql`
  query headerSpecialisationpage($id: String!) {
    headerSpecialisationpage(id: $id) {
      sys {
        id
      }
      title
      description
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
