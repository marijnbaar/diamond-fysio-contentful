import HomepageHeader from './Headers/HomepageHeader';
import Highlight from './Highlight';
import Specialisations from './Specialisations';

const ComponentList = ({ components }) =>
  components.map((component) => {
    if (component.sys.id) {
      switch (component.__typename) {
        case 'HeaderHomepage': {
          return <HomepageHeader key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'Highlight': {
          return <Highlight key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'SpecialisationHomeOverview': {
          return <Specialisations key={component.sys.id} id={component.sys.id} {...component} />;
        }
      }
    }
  });

export default ComponentList;
