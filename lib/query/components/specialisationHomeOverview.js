import gql from 'graphql-tag';
import fragmentSpecialisation from '../fragments/specialisation';
import { fragmentTeamMember } from '../fragments/teamMember';
import fragmentTestimonial from '../fragments/testimonial';

const querySpecialisationHomeOverview = gql`
  query specialisationHomeOverview($id: String!) {
    specialisationHomeOverview(id: $id) {
      overviewType
      sys {
        id
      }
      title
      subtitle
      description
      specialisationCollection {
        items {
          ...specialisation
        }
      }
      teamMemberCollection {
        items {
          ...teamMember
        }
      }
      testimonialFeatureCollection {
        items {
          ...testimonial
        }
      }
    }
  }
  ${fragmentSpecialisation}
  ${fragmentTeamMember}
  ${fragmentTestimonial}
`;

export default querySpecialisationHomeOverview;
