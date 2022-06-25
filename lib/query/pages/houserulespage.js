import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryHouserulespage = gql`
  query houserulespageCollectionQuery {
    houserulespageCollection(limit: 1) {
      items {
        slug
        title
        components: componentsCollection {
          ...componentListHouserulespage
        }
      }
    }
  }
  ${fragmentComponentList('Houserulespage')}
`;

export default queryHouserulespage;
