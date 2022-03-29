import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const getClient = (preview) => {
  const {
    REACT_APP_CONTENTFUL_SPACE_ID: spaceID,
    REACT_APP_CONTENTFUL_ACCESS_TOKEN: accessToken,
    REACT_APP_CONTENTFUL_PREVIEW_ACCESS_TOKEN: previewToken
  } = process.env;

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

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  });
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
