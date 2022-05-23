import gql from 'graphql-tag';
import fragmentTeamMember from '../fragments/teamMember';

const queryTeamOverview = gql`
  query teamOverview($id: String!) {
    teamOverview(id: $id) {
      sys {
        id
      }
      title
      description
      teamMemberCollection {
        items {
          ...teamMember
        }
      }
    }
  }
  ${fragmentTeamMember}
`;

export default queryTeamOverview;
