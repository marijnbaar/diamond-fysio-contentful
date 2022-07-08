import gql from 'graphql-tag';

const queryContactcomponent = gql`
  query contactComponent($id: String!) {
    contactComponent(id: $id) {
      sys {
        id
      }
      title
      description
      subtitle
      contactDescription {
        json
      }
      phonenumber
      email
      facebookLink
      instagramLink
      linkedInLink
    }
  }
`;

export default queryContactcomponent;
