import gql from 'graphql-tag';
import fragmentTeammemberTag from '../fragments/teamtag';

const queryTeammember = gql`
  query teamMember($id: String!) {
    teamMember(id: $id) {
      sys {
        id
      }
      name
      role
      description
      descriptionHomepage {
        json
      }
      linkedInUrl
      emailAddress
      phoneNumber
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
  }
  ${fragmentTeammemberTag}
`;

export default queryTeammember;
