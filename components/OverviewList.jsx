import Slideshow from './SlideshowSpecialisations/SlideShow';
import Team from './Team';
import SlideshowTestimonials from './SlideshowTestimonials/SlideShow';

const OverviewList = ({ overview }) => {
  switch (overview.overviewType) {
    case 'TestimonialOverview':
      return <SlideshowTestimonials key={overview.sys.id} id={overview.sys.id} {...overview} />;
    case 'SpecialisationOverview':
      return <Slideshow key={overview.sys.id} id={overview.sys.id} {...overview} />;
    case 'TeamOverview':
      return <Team key={overview.sys.id} id={overview.sys.id} {...overview} />;
    default:
      return null;
  }
};

export default OverviewList;
