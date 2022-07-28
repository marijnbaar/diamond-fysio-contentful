import { getComponent } from '../getData';
import queryHeaderHomepage from '../components/headerHomepage';
import queryHeaderTeampage from '../components/headerTeampage';
import queryHeaderSpecialisationpage from '../components/headerSpecialisationpage';
import queryHeaderAboutpage from '../components/headerAboutpage';
import queryHighlight from '../components/highlight';
import querySpecialisationHomeOverview from '../components/specialisationHomeOverview';
import queryTestimonialHomeOverview from '../components/testimonialHomeOverview';
import queryInfo from '../components/info';
import queryTestimonial from '../components/testimonial';
import queryTeamOverview from '../components/teamOverview';
import queryCta from '../components/cta';
import queryTeampageOverview from '../components/teampageOverview';
import queryCollaborations from '../components/collaborations';
import querySpecialisation from '../components/specialisation';
import queryMenuItem from '../components/menuItem';
import queryAboutcomponent from '../components/aboutcomponent';
import queryHeaderHouserulespage from '../components/headerHouserulespage';
import queryHeaderPricingpage from '../components/headerPricingpage';
import queryText from '../components/text';
import queryAppointmentCardOverview from '../components/appointmentCardOverview';
import queryContactcomponent from '../components/contactcomponent';
import queryThankyoucomponent from '../components/thankyoucomponent';
import queryCookiecomponent from '../components/cookiecomponent';

const getComponentsData = async (components, preview) => {
  return components
    ? (
        await Promise.all(
          components
            .filter((component) => {
              return component.sys.id;
            })
            .map((component) => {
              switch (component.__typename) {
                case 'HeaderHomepage': {
                  return getComponent(
                    queryHeaderHomepage,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'HeaderTeampage': {
                  return getComponent(
                    queryHeaderTeampage,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'HeaderAboutpage': {
                  return getComponent(
                    queryHeaderAboutpage,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'HeaderSpecialisationpage': {
                  return getComponent(
                    queryHeaderSpecialisationpage,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'HeaderHouserulespage': {
                  return getComponent(
                    queryHeaderHouserulespage,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'HeaderPricingpage': {
                  return getComponent(
                    queryHeaderPricingpage,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'Highlight': {
                  return getComponent(
                    queryHighlight,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'Info': {
                  return getComponent(queryInfo, component.__typename, component.sys.id, preview);
                }
                case 'SpecialisationHomeOverview': {
                  return getComponent(
                    querySpecialisationHomeOverview,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'TestimonialHomeOverview': {
                  return getComponent(
                    queryTestimonialHomeOverview,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'Testimonial': {
                  return getComponent(
                    queryTestimonial,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'TeamOverview': {
                  return getComponent(
                    queryTeamOverview,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'TeampageOverview': {
                  return getComponent(
                    queryTeampageOverview,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'Collaborations': {
                  return getComponent(
                    queryCollaborations,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'Specialisation': {
                  return getComponent(
                    querySpecialisation,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'Cta': {
                  return getComponent(queryCta, component.__typename, component.sys.id, preview);
                }
                case 'MenuItem': {
                  return getComponent(
                    queryMenuItem,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'AboutComponent': {
                  return getComponent(
                    queryAboutcomponent,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'ContactComponent': {
                  return getComponent(
                    queryContactcomponent,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'Text': {
                  return getComponent(queryText, component.__typename, component.sys.id, preview);
                }
                case 'AppointmentCardOverview': {
                  return getComponent(
                    queryAppointmentCardOverview,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'ThankyouComponent': {
                  return getComponent(
                    queryThankyoucomponent,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
                case 'CookieComponent': {
                  return getComponent(
                    queryCookiecomponent,
                    component.__typename,
                    component.sys.id,
                    preview
                  );
                }
              }
            })
        )
      ).filter((component) => component)
    : [];
};

export default getComponentsData;
