import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryCookiePage = gql`
  query cookiepageCollectionQuery {
    cookiepageCollection(limit: 1) {
      items {
        slug
        title
        components: componentsCollection {
          ...componentListCookiepage
        }
      }
    }
  }
  ${fragmentComponentList('Cookiepage')}
`;

export default queryCookiePage;
