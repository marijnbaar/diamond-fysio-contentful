import { getComponent } from '../getData';
import queryHeaderHomepage from '../components/headerHomepage';

const getComponentsData = async (components, preview) => {
  return components
    ? (
        await Promise.all(
          components
            .filter((component) => {
              console.log(component.sys);
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
              }
            })
        )
      ).filter((component) => component)
    : [];
};

export default getComponentsData;
