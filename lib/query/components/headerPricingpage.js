import gql from 'graphql-tag';

const queryHeaderPricingpage = gql`
  query headerPricingpage($id: String!) {
    headerPricingpage(id: $id) {
      sys {
        id
      }
      image {
        url
      }
    }
  }
`;

export default queryHeaderPricingpage;
