import '../styles/globals.css';
import Layout from '../components/Layout/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <Layout
      navigation={pageProps.navigation}
      footer={pageProps.footer}
      meta={pageProps.meta || pageProps.meta_data}
      slug={pageProps.slug}
    >
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
