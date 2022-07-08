import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryContactPage = gql`
  query contactpageCollectionQuery {
    contactpageCollection(limit: 1) {
      items {
        slug
        title
        components: componentsCollection {
          ...componentListContactpage
        }
      }
    }
  }
  ${fragmentComponentList('Contactpage')}
`;

export default queryContactPage;
