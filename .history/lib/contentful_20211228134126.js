

import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';


const query = `{
  teamMemberCollection {
    items {
      name
      profilePicture {
        url
      }
      description
    }
  }
}`

export { query}