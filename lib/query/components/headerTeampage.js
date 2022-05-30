import gql from 'graphql-tag';

const queryHeaderTeampage = gql`
  query headerTeampage($id: String!) {
    headerTeampage(id: $id) {
      sys {
        id
      }
      title
      description
    }
  }
`;

export default queryHeaderTeampage;
