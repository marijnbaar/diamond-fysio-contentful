import gql from 'graphql-tag';
import fragmentButton from '../fragments/button';

const queryHeaderPricingpage = gql`
  query headerPricingpage($id: String!) {
    headerPricingpage(id: $id) {
      headerType
      sys {
        id
      }
      title {
        json
      }
      info {
        json
      }
      descriptionRichText {
        json
      }
      image {
        url
      }
      buttonCollection {
        items {
          ...button
        }
      }
    }
  }
  ${fragmentButton}
`;

export default queryHeaderPricingpage;
