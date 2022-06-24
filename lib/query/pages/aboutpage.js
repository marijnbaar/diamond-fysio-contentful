import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryAboutPage = gql`
  query aboutpageCollectionQuery {
    aboutpageCollection(limit: 1) {
      items {
        slug
        title
        components: componentsCollection {
          ...componentListAboutpage
        }
      }
    }
  }
  ${fragmentComponentList('Aboutpage')}
`;

export default queryAboutPage;
