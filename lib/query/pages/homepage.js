import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryHomePage = gql`
  query homepageCollectionQuery {
    homepageCollection(limit: 1) {
      items {
        title
        components: componentsCollection {
          ...componentListHomepage
        }
      }
    }
  }
  ${fragmentComponentList('Homepage')}
`;

export default queryHomePage;
