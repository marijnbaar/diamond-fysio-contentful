import '../styles/globals.css';
import Layout from '../components/Layout/Layout';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover"
        />
      </Head>
      <Layout
        navigation={pageProps.navigation}
        footer={pageProps.footer}
        meta={pageProps.meta || pageProps.meta_data}
        slug={pageProps.slug}
      >
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
