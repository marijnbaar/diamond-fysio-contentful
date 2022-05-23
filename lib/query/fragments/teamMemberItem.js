import gql from 'graphql-tag';

const fragmentTeamMemberItem = gql`
  fragment teamMemberItem on TeamMemberItem {
    name
    role
    description
    image {
      url
    }
  }
`;

export default fragmentTeamMemberItem;
