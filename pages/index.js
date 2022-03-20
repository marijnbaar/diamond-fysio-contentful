import Head from 'next/head';
import Menu from '../components/Menu';
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

const Home = ({ title, componentsCollection }) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Menu />
      <ComponentList components={componentsCollection.items} />
      <HighLight />
      <Homepage {...componentsCollection.items[0]} />
      <footer></footer>
    </div>
  );
};

export default Home;
