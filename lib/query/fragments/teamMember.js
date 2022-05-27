import gql from 'graphql-tag';

const fragmentTeamMember = gql`
  fragment teamMember on TeamMember {
    name
    role
    description
    specialisations
    image {
      url
    }
  }
`;

export { fragmentTeamMember };
