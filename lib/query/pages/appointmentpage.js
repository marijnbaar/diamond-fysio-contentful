import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';

const queryAppointmentpage = gql`
  query appointmentpageCollectionQuery {
    appointmentpageCollection(limit: 1) {
      items {
        slug
        title
        components: componentsCollection {
          ...componentListAppointmentpage
        }
      }
    }
  }
  ${fragmentComponentList('Appointmentpage')}
`;

export default queryAppointmentpage;
