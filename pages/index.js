import { getPage } from '../lib/query/getData';
import ComponentList from '../components/ComponentList';

export const getStaticProps = async ({ preview = false }) => {
  const pageData = (await getPage('Homepage', undefined, preview)) ?? [];
  const url = `https://graph.instagram.com/me/media?fields=id,caption,media,url,timestamp,media_type,permalink&access_token=${process.env.INSTAGRAM_API_KEY}`;
  const data = await fetch(url);
  const feed = await data.json();

  return {
    props: {
      ...pageData,
      instagramPosts: feed,
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
