import queryHomePage from './pages/homepage';
import queryTeamPage from './pages/teampage';

// Get query of a model
const getQuery = (modelId) => {
  switch (modelId) {
    case 'Homepage':
      return queryHomePage;
    case 'Teampage':
      return queryTeamPage;
  }
};

export default getQuery;
