import gql from 'graphql-tag';

const queryTestimonial = gql`
  query testimonial($id: String!, $locale: String) {
    testimonial(id: $id, locale: $locale) {
      sys {
        id
      }
      image {
        url
      }
      quote
      name
      profession
    }
  }
`;

export default queryTestimonial;
