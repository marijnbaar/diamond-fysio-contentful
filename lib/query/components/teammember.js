import gql from 'graphql-tag';
import fragmentTeammemberTag from '../fragments/teamtag';

const queryTeammember = gql`
  query teamMember($id: String!, $locale: String) {
    teamMember(id: $id, locale: $locale) {
      sys {
        id
      }
      name
      role
      descriptionTeampage {
        json
      }
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
      location
      quote
      image {
        url
      }
      specialisationTagsCollection(locale: $locale) {
        items {
          ...teammemberTag
        }
      }
    }
  }
  ${fragmentTeammemberTag}
`;

export default queryTeammember;
