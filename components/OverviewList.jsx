import Slideshow from './SlideshowSpecialisations/SlideShow';
import Team from './Team';
import SlideshowTestimonials from './SlideshowTestimonials/SlideShow';

const OverviewList = ({ overview }) => {
  const props = {
    ...overview,
    description: overview.descriptionText || overview.description
  };

  switch (overview.overviewType) {
    case 'TestimonialOverview':
      return <SlideshowTestimonials key={overview.sys.id} id={overview.sys.id} {...props} />;
    case 'SpecialisationOverview':
      return <Slideshow key={overview.sys.id} id={overview.sys.id} {...props} />;
    case 'TeamOverview':
      return <Team key={overview.sys.id} id={overview.sys.id} {...props} />;
    default:
      return null;
  }
};

export default OverviewList;
