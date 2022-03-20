import queryHomePage from './pages/homepage';

// Get query of a model
const getQuery = (modelId) => {
  switch (modelId) {
    case 'Homepage':
      return queryHomePage;
  }
};

export default getQuery;
