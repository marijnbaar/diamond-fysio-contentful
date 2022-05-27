import gql from 'graphql-tag';
import { fragmentTeamMember } from '../fragments/teamMember';

const queryTeampageOverview = gql`
  query teampageOverview($id: String!) {
    teampageOverview(id: $id) {
      sys {
        id
      }
      teamMemberCollection {
        items {
          ...teamMember
        }
      }
    }
  }
  ${fragmentTeamMember}
`;

export default queryTeampageOverview;
