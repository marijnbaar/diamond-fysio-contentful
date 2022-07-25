import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryThankyouPage = gql`
  query thankyoupageCollectionQuery {
    thankyoupageCollection(limit: 1) {
      items {
        slug
        title
        components: componentsCollection {
          ...componentListThankyoupage
        }
      }
    }
  }
  ${fragmentComponentList('Thankyoupage')}
`;

export default queryThankyouPage;
