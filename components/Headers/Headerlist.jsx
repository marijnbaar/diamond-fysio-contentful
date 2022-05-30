import HomepageHeader from './HomepageHeader';
import TeampageHeader from './TeampageHeader';

const HeaderList = (headerProps) => {
  switch (headerProps.__typename) {
    case 'Homepage': {
      return <HomepageHeader {...headerProps} />;
    }
    case 'Teampage': {
      return <TeampageHeader {...headerProps} />;
    }

    default:
      return <></>;
  }
};

export default HeaderList;
