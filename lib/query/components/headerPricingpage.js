import gql from 'graphql-tag';
import fragmentButton from '../fragments/button';

const queryHeaderPricingpage = gql`
  query headerPricingpage($id: String!, $locale: String) {
    headerPricingpage(id: $id, locale: $locale) {
      headerType
      showPopup
      popupText
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
      buttonCollection(locale: $locale) {
        items {
          ...button
        }
      }
    }
  }
  ${fragmentButton}
`;

export default queryHeaderPricingpage;
