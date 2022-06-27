import gql from 'graphql-tag';

const fragmentTeammemberTag = gql`
  fragment teammemberTag on TeammemberTag {
    sys {
      id
    }
    tag
  }
`;

export default fragmentTeammemberTag;
