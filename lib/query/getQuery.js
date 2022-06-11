import queryHomePage from './pages/homepage';
import querySpecialisationPage from './pages/specialisationpage';
import queryTeamPage from './pages/teampage';

// Get query of a model
const getQuery = (modelId) => {
  switch (modelId) {
    case 'Homepage':
      return queryHomePage;
    case 'Teampage':
      return queryTeamPage;
    case 'Specialisationpage':
      return querySpecialisationPage;
  }
};

export default getQuery;
