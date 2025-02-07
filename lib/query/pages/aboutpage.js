import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryAboutPage = gql`
  query aboutpageCollectionQuery {
    aboutpageCollection(limit: 25) {
      items {
        slug
        title
        pageType
        components: componentsCollection {
          ...componentListAboutpage
        }
      }
    }
  }
  ${fragmentComponentList('Aboutpage')}
`;

export default queryAboutPage;
