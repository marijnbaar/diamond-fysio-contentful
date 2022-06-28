import gql from 'graphql-tag';
import fragmentTestimonial from '../fragments/testimonial';

const queryTestimonialHomeOverview = gql`
  query testimonialHomeOverview($id: String!) {
    testimonialHomeOverview(id: $id) {
      sys {
        id
      }
      image {
        url
      }
      testimonialCollection {
        items {
          ...testimonial
        }
      }
    }
  }
  ${fragmentTestimonial}
`;

export default queryTestimonialHomeOverview;
