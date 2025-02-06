import React from 'react';
import SpecialisationHeader from './SpecialisationpageHeader';
import HomepageHeader from './HomepageHeader';
import TeampageHeader from './TeampageHeader';
import GenericpageHeader from './GenericpageHeader';

const HeaderList = ({ header }) => {
  switch (header.headerType) {
    case 'HeaderSpecialisationpage':
      return <SpecialisationHeader key={header.sys.id} {...header} />;
    case 'HeaderHomepage':
      return <HomepageHeader key={header.sys.id} {...header} />;
    case 'HeaderAboutpage':
      return <GenericpageHeader key={header.sys.id} {...header} />;
    case 'HeaderTeampage':
      return <TeampageHeader key={header.sys.id} {...header} />;
    case 'HeaderPricingpage':
      return <GenericpageHeader key={header.sys.id} {...header} />;
    case 'HeaderHouserulespage':
      return <GenericpageHeader key={header.sys.id} {...header} />;
    default:
      return null;
  }
};

export default HeaderList;
