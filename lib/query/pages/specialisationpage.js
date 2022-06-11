import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const querySpecialisationPage = gql`
  query specialisationpageCollectionQuery {
    specialisationpageCollection(limit: 1) {
      items {
        slug
        title
        components: componentsCollection {
          ...componentListSpecialisationpage
        }
      }
    }
  }
  ${fragmentComponentList('Specialisationpage')}
`;

export default querySpecialisationPage;
