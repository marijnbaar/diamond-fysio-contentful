import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

let client;
let previewClient;

const getClient = (preview) => {
  const {
    CONTENTFUL_SPACE_ID: spaceID,
    CONTENTFUL_ACCESS_TOKEN: accessToken,
    CONTENTFUL_PREVIEW_ACCESS_TOKEN: previewToken
  } = process.env;

  if (preview && previewClient) return previewClient;
  if (!preview && client) return client;

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${preview ? previewToken : accessToken}`
      }
    };
  });

  const httpLink = createHttpLink({
    uri: `https://graphql.contentful.com/content/v1/spaces/${spaceID}`
  });

  const newClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      resultCaching: true,
      dataIdFromObject: (object) => (object.sys ? object.sys.id : null)
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first'
      },
      query: {
        fetchPolicy: 'cache-first'
      }
    }
  });

  if (preview) {
    previewClient = newClient;
    return previewClient;
  } else {
    client = newClient;
    return client;
  }
};

export const errorHandling = async (error) => {
  if (error.networkError && error.networkError.statusCode === 429) {
    return false;
  } else if (error.networkError && error.networkError.result) {
    throw new Error(error.networkError.result.errors[0].message);
  } else {
    throw error;
  }
};

export default getClient;
