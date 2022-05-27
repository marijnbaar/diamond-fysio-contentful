import { getComponent } from '../getData';
import queryHeaderHomepage from '../components/headerHomepage';
import queryHighlight from '../components/highlight';
import querySpecialisationHomeOverview from '../components/specialisationHomeOverview';
import queryInfo from '../components/info';
import queryTestimonial from '../components/testimonial';
import queryTeamOverview from '../components/teamOverview';
import queryCta from '../components/cta';
import queryTeampageOverview from '../components/teampageOverview';
import queryCollaborations from '../components/collaborations';

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
                case 'Cta': {
                  return getComponent(queryCta, component.__typename, component.sys.id, preview);
                }
              }
            })
        )
      ).filter((component) => component)
    : [];
};

export default getComponentsData;
