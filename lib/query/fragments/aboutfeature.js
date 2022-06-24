import gql from 'graphql-tag';
// import fragmentButton from './button';

const fragmentAboutFeature = gql`
  fragment aboutFeature on AboutFeature {
    sys {
      id
    }
    title
    description
    logo
    # button {
    #   ...button
    # }
  }
`;

export default fragmentAboutFeature;
