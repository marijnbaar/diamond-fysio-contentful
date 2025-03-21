import { getComponent } from '../getData';
import queryHighlight from '../components/highlight';
import querySpecialisationHomeOverview from '../components/specialisationHomeOverview';
import queryInfo from '../components/info';
import queryTestimonial from '../components/testimonial';
import queryCta from '../components/cta';
import queryCollaborations from '../components/collaborations';
import querySpecialisation from '../components/specialisation';
import queryMenuItem from '../components/menuItem';
import queryAboutcomponent from '../components/aboutcomponent';
import queryHeaderPricingpage from '../components/headerPricingpage';
import queryText from '../components/text';
import queryAppointmentCardOverview from '../components/appointmentCardOverview';
import queryContactcomponent from '../components/contactcomponent';
import queryThankyoucomponent from '../components/thankyoucomponent';
import queryTeammember from '../components/teammember';

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
                case 'Testimonial': {
                  return getComponent(
                    queryTestimonial,
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
                case 'TeamMember': {
                  return getComponent(
                    queryTeammember,
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
