import gql from 'graphql-tag';

const fragmentTestimonial = gql`
  fragment testimonial on Testimonial {
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
`;

export default fragmentTestimonial;
