import gql from 'graphql-tag';
import fragmentSpecialisation from '../fragments/specialisation';

const querySpecialisationHomeOverview = gql`
  query specialisationHomeOverview($id: String!) {
    specialisationHomeOverview(id: $id) {
      sys {
        id
      }
      title
      subtitle
      description
      specialisationCollection {
        items {
          ...specialisation
        }
      }
    }
  }
  ${fragmentSpecialisation}
`;

export default querySpecialisationHomeOverview;
