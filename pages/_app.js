import '../styles/globals.css';
import Layout from '../components/Layout/Layout';
import React from 'react';

function MyApp({ Component, pageProps }) {
  return (
    <Layout
      navigation={pageProps.navigation}
      footer={pageProps.footer}
      // meta={pageProps.meta_data}
      // preview={pageProps.preview}
    >
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
