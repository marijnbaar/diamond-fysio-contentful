import { getPage } from '../lib/query/getData';
import ComponentList from '../components/ComponentList';

export const getStaticProps = async ({ preview = false }) => {
  const pageData = (await getPage('Homepage', undefined, preview)) ?? [];

  return {
    props: {
      ...pageData,
      preview
    }
  };
};

const Home = ({ components }) => {
  return (
    <div>
      <ComponentList components={components} />
    </div>
  );
};

export default Home;
