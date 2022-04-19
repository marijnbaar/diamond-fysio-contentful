import gql from 'graphql-tag';

const fragmentSpecialisation = gql`
  fragment specialisation on Specialisation {
    title
    subtitle
    description {
      json
    }
  }
`;

export default fragmentSpecialisation;
