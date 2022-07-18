import { getPage } from '../lib/query/getData';
import ComponentList from '../components/ComponentList';
import { loadPosts } from './api/fetchPosts';

export const getStaticProps = async ({ preview = false }) => {
  const pageData = (await getPage('Homepage', undefined, preview)) ?? [];
  const instagramPosts = await loadPosts();

  return {
    props: {
      ...pageData,
      instagramPosts,
      preview
    }
  };
};

const Home = (props) => {
  return (
    <div>
      <ComponentList components={props.components} instagramPosts={props.instagramPosts} />
    </div>
  );
};

export default Home;
