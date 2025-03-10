import gql from 'graphql-tag';
import fragmentSpecialisation from '../fragments/specialisation';
import { fragmentTeamMember } from '../fragments/teamMember';

const querySpecialisationHomeOverview = gql`
  query specialisationHomeOverview($id: String!) {
    specialisationHomeOverview(id: $id) {
      overviewType
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
      teamMemberCollection {
        items {
          ...teamMember
        }
      }
    }
  }
  ${fragmentSpecialisation}
  ${fragmentTeamMember}
`;

export default querySpecialisationHomeOverview;
