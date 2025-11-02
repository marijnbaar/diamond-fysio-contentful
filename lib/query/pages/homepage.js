import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryHomePage = gql`
  query homepageCollectionQuery($locale: String) {
    homepageCollection(limit: 1, locale: $locale) {
      items {
        sys {
          id
        }
        slug
        title
        components: componentsCollection(locale: $locale) {
          ...componentListHomepage
        }
      }
    }
  }
  ${fragmentComponentList('Homepage')}
`;

export default queryHomePage;
