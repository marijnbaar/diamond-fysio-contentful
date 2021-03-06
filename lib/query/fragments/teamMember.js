import gql from 'graphql-tag';
import fragmentTeammemberTag from './teamtag';

const fragmentTeamMember = gql`
  fragment teamMember on TeamMember {
    name
    role
    description
    descriptionHomepage {
      json
    }
    linkedInUrl
    emailAddress
    phoneNumber
    specialisations
    website
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
