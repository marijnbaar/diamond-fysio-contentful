

import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const getClient = (preview) => {
  const {
    CONTENTFUL_SPACE_ID: spaceId,
    CONTENTFUL_ACCESS_TOKEN: accessToken,
    CONTENTFUL_PREVIEW_ACCESS_TOKEN: previewToken,
  } = process.env;

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${preview ? accessToken : previewToken}`,
      },
    };
  });

  const httpLink = createHttpLink({
    uri: `https://graphql.contentful.com/content/v1/spaces/${spaceId}`,
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

export default getClient;



const accessToken = "2BXxL6w674uw8WYJagRluKrqpB_kSL2hP3czCI1LA64"
const spaceId = "vmz4lv5fgrcj"
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

export { accessToken, spaceId, query}