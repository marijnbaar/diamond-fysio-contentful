import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryHomePage = gql`
  query homepageCollectionQuery($slug: String, $locale: String) {
    homepageCollection(where: { slug: $slug }, limit: 1, locale: $locale) {
      items {
        sys {
          id
        }
        slug
        title
        components: componentsCollection(locale: $locale, limit: 15) {
          ...componentListHomepage
        }
      }
    }
  }
  ${fragmentComponentList('Homepage')}
`;

export default queryHomePage;
