import HomepageHeader from './Headers/HomepageHeader';
import Highlight from './Highlight';
import Info from './Info';
import Team from './Team';
import CTA from './CTA';
import Teammember from './Teammember';
import Collaborations from './Collaborations';
import TeampageHeader from './Headers/TeampageHeader';
import SpecialisationHeader from './Headers/SpecialisationpageHeader';
import Specialisation from './Specialisation';
import Slideshow from './SlideshowSpecialisations/SlideShow';
import SlideshowTestimonials from './SlideshowTestimonials/SlideShow';
import AboutInformation from './AboutInformation';
import GenericpageHeader from './Headers/GenericpageHeader';
import Text from './Text';
import Appointment from './Appointment';
import Contact from './Contact/Contact';
import Thankyou from './Thankyou';

const ComponentList = (props) =>
  props.components.map((component) => {
    if (component.sys.id) {
      switch (component.__typename) {
        case 'HeaderHomepage': {
          return <HomepageHeader key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'HeaderTeampage': {
          return <TeampageHeader key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'HeaderAboutpage': {
          return <GenericpageHeader key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'HeaderPricingpage': {
          return <GenericpageHeader key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'HeaderHouserulespage': {
          return <GenericpageHeader key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'HeaderSpecialisationpage': {
          return (
            <SpecialisationHeader key={component.sys.id} id={component.sys.id} {...component} />
          );
        }
        case 'Highlight': {
          return <Highlight key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'SpecialisationHomeOverview': {
          return <Slideshow key={component.sys.id} id={component.sys.id} {...component} />;
        }
        case 'TestimonialHomeOverview': {
          return (
            <SlideshowTestimonials key={component.sys.id} id={component.sys.id} {...component} />
          );
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
        case 'CookieComponent': {
          return <Text key={component.sys.id} id={component.sys.id} {...component} />;
        }
      }
    }
  });

export default ComponentList;
