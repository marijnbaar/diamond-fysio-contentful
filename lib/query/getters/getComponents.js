import { getComponent } from '../getData';
import queryHeaderHomepage from '../components/headerHomepage';
import queryHighlight from '../components/highlight';
import querySpecialisationHomeOverview from '../components/specialisationHomeOverview';

const getComponentsData = async (components, preview) => {
  console.log('test Marijn', components);
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
                case 'SpecialisationHomeOverview': {
                  return getComponent(
                    querySpecialisationHomeOverview,
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
