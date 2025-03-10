import React from 'react';
import Slideshow from './SlideshowSpecialisations/SlideShow';
import Team from './Team';

const OverviewList = ({ overview }) => {
  switch (overview.overviewType) {
    case 'SpecialisationOverview':
      return <Slideshow key={overview.sys.id} id={overview.sys.id} {...overview} />;
    case 'TeamOverview':
      return <Team key={overview.sys.id} id={overview.sys.id} {...overview} />;
    default:
      return null;
  }
};

export default OverviewList;
