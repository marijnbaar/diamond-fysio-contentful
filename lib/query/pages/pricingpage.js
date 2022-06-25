import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryPricingPage = gql`
  query pricingpageCollectionQuery {
    pricingpageCollection(limit: 1) {
      items {
        slug
        title
        components: componentsCollection {
          ...componentListPricingpage
        }
      }
    }
  }
  ${fragmentComponentList('Pricingpage')}
`;

export default queryPricingPage;
