import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryTeammemberpage = gql`
  query teammemberpageCollectionQuery {
    teammemberpageCollection(limit: 20) {
      items {
        slug
        title
        components: componentsCollection {
          ...componentListTeammemberpage
        }
      }
    }
  }
  ${fragmentComponentList('Teammemberpage')}
`;

export default queryTeammemberpage;
