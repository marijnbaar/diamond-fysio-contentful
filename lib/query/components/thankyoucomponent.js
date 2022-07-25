import gql from 'graphql-tag';

const queryThankyoucomponent = gql`
  query thankyouComponent($id: String!) {
    thankyouComponent(id: $id) {
      sys {
        id
      }
      bedanktekst
    }
  }
`;

export default queryThankyoucomponent;
