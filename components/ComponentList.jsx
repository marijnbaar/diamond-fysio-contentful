import HomepageHeader from './Headers/HomepageHeader';
import Highlight from './Highlight';
import Specialisations from './Specialisations';
import Info from './Info';
import Testimonial from './Testimonial';

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
        case 'Info': {
          return <Info key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'Testimonial': {
          return <Testimonial key={component.sys.id} id={component.sys.id} {...component} />;
        }
      }
    }
  });

export default ComponentList;
