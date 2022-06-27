import gql from 'graphql-tag';
import fragmentTeammemberTag from './teamtag';
// import fragmentSpecialisationTags from './teamtagCollection';
const fragmentTeamMember = gql`
  fragment teamMember on TeamMember {
    name
    role
    description
    specialisations
    image {
      url
    }
    specialisationTagsCollection {
      items {
        ...teammemberTag
      }
    }
  }
  ${fragmentTeammemberTag}
`;

export { fragmentTeamMember };
