import HomepageHeader from './HomepageHeader';
import TeampageHeader from './TeampageHeader';
import AboutpageHeader from './AboutpageHeader';

const HeaderList = (headerProps) => {
  switch (headerProps.__typename) {
    case 'Homepage': {
      return <HomepageHeader {...headerProps} />;
    }
    case 'Teampage': {
      return <TeampageHeader {...headerProps} />;
    }
    case 'Aboutpage': {
      return <AboutpageHeader {...headerProps} />;
    }

    default:
      return <></>;
  }
};

export default HeaderList;
