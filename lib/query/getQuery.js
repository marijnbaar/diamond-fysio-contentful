import queryAboutPage from './pages/aboutpage';
import queryHomePage from './pages/homepage';

// Get query of a model
const getQuery = (modelId) => {
  switch (modelId) {
    case 'Homepage':
      return queryHomePage;
    case 'Aboutpage':
    case 'Teammemberpage':
      // Teammemberpage is gewoon een Aboutpage met pageType Teammemberpage
      return queryAboutPage;
  }
};

export default getQuery;
