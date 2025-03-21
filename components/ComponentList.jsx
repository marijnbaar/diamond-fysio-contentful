import HeaderList from './Headers/Headerlist';
import Highlight from './Highlight';
import Info from './Info';
import CTA from './CTA';
import Specialisation from './Specialisation';
import AboutInformation from './AboutInformation';
import Text from './Text';
import Appointment from './Appointment';
import Contact from './Contact/Contact';
import Thankyou from './Thankyou';
import Teammemberpage from './Teammemberpage';
import SlideshowCollaborations from './SlideshowCollaborations/SlideShow';
import OverviewList from './OverviewList';

const ComponentList = (props) => {
  return props.components.map((component) => {
    if (component.sys.id) {
      switch (component.__typename) {
        case 'HeaderSpecialisationpage':
        case 'HeaderHomepage':
        case 'HeaderAboutpage':
        case 'HeaderTeampage':
        case 'HeaderPricingpage':
        case 'HeaderHouserulespage': {
          return <HeaderList key={component.sys.id} header={component} />;
        }
        case 'TeamOverview':
        case 'TestimonialHomeOverview':
        case 'SpecialisationHomeOverview': {
          return <OverviewList key={component.sys.id} id={component.sys.id} overview={component} />;
        }
        case 'Highlight': {
          return <Highlight key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'Info': {
          return (
            <Info
              key={component.sys.id}
              id={component.sys.id}
              {...component}
              instagramPosts={props.instagramPosts}
            />
          );
        }
        case 'Cta': {
          return <CTA key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'Collaborations': {
          return (
            <SlideshowCollaborations key={component.sys.id} id={component.sys.id} {...component} />
          );
        }
        case 'Specialisation': {
          return <Specialisation key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'AboutComponent': {
          return <AboutInformation key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'ContactComponent': {
          return <Contact key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'Text': {
          return <Text key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'AppointmentCardOverview': {
          return <Appointment key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'ThankyouComponent': {
          return <Thankyou key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'TeamMember': {
          return <Teammemberpage key={component.sys.id} id={component.sys.id} {...component} />;
        }
      }
    }
  });
};

export default ComponentList;
