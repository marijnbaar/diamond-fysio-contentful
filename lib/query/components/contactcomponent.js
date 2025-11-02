import gql from 'graphql-tag';

const queryContactcomponent = gql`
  query contactComponent($id: String!, $locale: String) {
    contactComponent(id: $id, locale: $locale) {
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
