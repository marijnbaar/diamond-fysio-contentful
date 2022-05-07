import gql from 'graphql-tag';

const queryTestimonial = gql`
  query testimonial($id: String!) {
    testimonial(id: $id) {
      sys {
        id
      }
      image {
        url
      }
    }
  }
`;

export default queryTestimonial;
