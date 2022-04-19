import gql from 'graphql-tag';

const queryHighlight = gql`
  query highlight($id: String!) {
    highlight(id: $id) {
      sys {
        id
      }
      info
    }
  }
`;

export default queryHighlight;
