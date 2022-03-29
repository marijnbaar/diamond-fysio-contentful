import gql from 'graphql-tag';

const queryHighlight = gql`
  query Highlight($id: String!) {
    Highlight(id: $id) {
      sys {
        id
      }
      info
    }
  }
`;

export default queryHighlight;
