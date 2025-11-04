import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryAboutPage = gql`
  query aboutpageCollectionQuery($locale: String) {
    aboutpageCollection(limit: 100, locale: $locale) {
      items {
        sys {
          id
        }
        slug
        title
        pageType
        components: componentsCollection(locale: $locale) {
          ...componentListAboutpage
        }
      }
    }
  }
  ${fragmentComponentList('Aboutpage')}
`;

export default queryAboutPage;
