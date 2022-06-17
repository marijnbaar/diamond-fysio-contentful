import gql from 'graphql-tag';
import fragmentButton from './button';

const fragmentSpecialisation = gql`
  fragment specialisation on Specialisation {
    title
    subtitle
    shortDescription
    description {
      json
    }
    image {
      url
    }
    button {
      ...button
    }
  }
  ${fragmentButton}
`;

export default fragmentSpecialisation;
