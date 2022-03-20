import Homepage from '../components/Homepage';
import { getPage } from '../lib/query/getData';
import HighLight from '../components/Highlight';
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

const Home = ({ componentsCollection }) => {
  return (
    <div>
      <ComponentList components={componentsCollection.items} />
      <HighLight />
      <Homepage {...componentsCollection.items[0]} />
    </div>
  );
};

export default Home;
