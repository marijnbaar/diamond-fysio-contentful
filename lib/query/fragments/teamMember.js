import gql from 'graphql-tag';

const fragmentTeamMember = gql`
  fragment teamMember on TeamMember {
    name
    role
    description
    image {
      url
    }
  }
`;

export default fragmentTeamMember;
