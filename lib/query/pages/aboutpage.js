import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryAboutPage = gql`
  query aboutpageCollectionQuery($slug: String, $locale: String) {
    aboutpageCollection(where: { slug: $slug }, limit: 1, locale: $locale) {
      items {
        sys {
          id
        }
        slug
        title
        pageType
        components: componentsCollection(locale: $locale, limit: 15) {
          ...componentListAboutpage
        }
      }
    }
  }
  ${fragmentComponentList('Aboutpage')}
`;

export default queryAboutPage;
