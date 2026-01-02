import gql from 'graphql-tag';
import fragmentSpecialisation from '../fragments/specialisation';
import { fragmentTeamMember } from '../fragments/teamMember';
import fragmentTestimonial from '../fragments/testimonial';

const querySpecialisationHomeOverview = gql`
  query specialisationHomeOverview($id: String!, $locale: String) {
    specialisationHomeOverview(id: $id, locale: $locale) {
      overviewType
      sys {
        id
      }
      title
      subtitle
      description
      specialisationCollection(locale: $locale, limit: 20) {
        items {
          ...specialisation
        }
      }
      teamMemberCollection(locale: $locale, limit: 30) {
        items {
          ...teamMember
        }
      }
      testimonialFeatureCollection(locale: $locale, limit: 10) {
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
