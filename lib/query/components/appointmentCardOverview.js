import gql from 'graphql-tag';
import fragmentAppointmentCard from '../fragments/appointmentcard';

const queryAppointmentCardOverview = gql`
  query appointmentCardOverview($id: String!) {
    appointmentCardOverview(id: $id) {
      sys {
        id
      }
      title
      description
      longDescription {
        json
      }
      alert
      alertDescription
      appointmentCardsCollection {
        items {
          ...appointmentCard
        }
      }
    }
  }
  ${fragmentAppointmentCard}
`;

export default queryAppointmentCardOverview;
