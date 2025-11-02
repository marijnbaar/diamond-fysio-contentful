import gql from 'graphql-tag';
import fragmentAppointmentCard from '../fragments/appointmentcard';

const queryAppointmentCardOverview = gql`
  query appointmentCardOverview($id: String!, $locale: String) {
    appointmentCardOverview(id: $id, locale: $locale) {
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
      appointmentCardsCollection(locale: $locale) {
        items {
          ...appointmentCard
        }
      }
    }
  }
  ${fragmentAppointmentCard}
`;

export default queryAppointmentCardOverview;
