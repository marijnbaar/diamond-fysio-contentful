import gql from 'graphql-tag';
import fragmentTeammemberTag from './teamtag';

const fragmentTeamMember = gql`
  fragment teamMember on TeamMember {
    name
    role
    descriptionHomepage {
      json
    }
    contact {
      json
    }
    linkedInUrl
    emailAddress
    phoneNumber
    website
    link {
      ... on Aboutpage {
        slug
        pageType
        __typename
        sys {
          id
        }
      }
    }
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
