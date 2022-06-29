import gql from 'graphql-tag';
import fragmentButton from './button';

const fragmentAppointmentCard = gql`
  fragment appointmentCard on AppointmentCard {
    title
    description
    button {
      ...button
    }
  }
  ${fragmentButton}
`;

export default fragmentAppointmentCard;
