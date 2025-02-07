import queryAboutPage from './pages/aboutpage';
import queryHomePage from './pages/homepage';

// Get query of a model
const getQuery = (modelId) => {
  switch (modelId) {
    case 'Homepage':
      return queryHomePage;
    case 'Aboutpage':
      return queryAboutPage;
  }
};

export default getQuery;
