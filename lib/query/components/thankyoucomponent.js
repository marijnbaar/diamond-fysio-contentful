import gql from 'graphql-tag';

const queryThankyoucomponent = gql`
  query thankyouComponent($id: String!, $locale: String) {
    thankyouComponent(id: $id, locale: $locale) {
      sys {
        id
      }
      bedanktekst
    }
  }
`;

export default queryThankyoucomponent;
