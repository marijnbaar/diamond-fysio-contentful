import HomepageHeader from './Headers/HomepageHeader';
import Highlight from './Highlight';
import Specialisations from './Specialisations';
import Info from './Info';
import Testimonial from './Testimonial';
import Team from './Team';
import CTA from './CTA';
import Teammember from './Teammember';
import Collaborations from './Collaborations';

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
        case 'TeamOverview': {
          return <Team key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'Cta': {
          return <CTA key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'TeampageOverview': {
          return <Teammember key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'Collaborations': {
          return <Collaborations key={component.sys.id} id={component.sys.id} {...component} />;
        }
      }
    }
  });

export default ComponentList;
