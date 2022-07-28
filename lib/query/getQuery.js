import queryAboutPage from './pages/aboutpage';
import queryHomePage from './pages/homepage';
import querySpecialisationPage from './pages/specialisationpage';
import queryTeamPage from './pages/teampage';
import queryPricingPage from './pages/pricingpage';
import queryHouserulespage from './pages/houserulespage';
import queryAppointmentpage from './pages/appointmentpage';
import queryContactPage from './pages/contactpage';
import queryThankyouPage from './pages/thankyoupage';
import queryCookiePage from './pages/cookiepage';

// Get query of a model
const getQuery = (modelId) => {
  switch (modelId) {
    case 'Homepage':
      return queryHomePage;
    case 'Teampage':
      return queryTeamPage;
    case 'Aboutpage':
      return queryAboutPage;
    case 'Appointmentpage':
      return queryAppointmentpage;
    case 'Pricingpage':
      return queryPricingPage;
    case 'Houserulespage':
      return queryHouserulespage;
    case 'Specialisationpage':
      return querySpecialisationPage;
    case 'Contactpage':
      return queryContactPage;
    case 'Thankyoupage':
      return queryThankyouPage;
    case 'Cookiepage':
      return queryCookiePage;
  }
};

export default getQuery;
