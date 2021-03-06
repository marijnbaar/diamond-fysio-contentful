import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryTeamPage = gql`
  query teampageCollectionQuery {
    teampageCollection(limit: 1) {
      items {
        slug
        title
        components: componentsCollection {
          ...componentListTeampage
        }
      }
    }
  }
  ${fragmentComponentList('Teampage')}
`;

export default queryTeamPage;
