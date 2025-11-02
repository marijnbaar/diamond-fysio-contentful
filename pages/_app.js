import '../styles/globals.css';
import Layout from '../components/Layout/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <Layout
      navigation={pageProps.navigation}
      footer={pageProps.footer}
      footerI18n={pageProps.footerI18n}
      navI18n={pageProps.navI18n}
      cookiesI18n={pageProps.cookiesI18n}
      // meta={pageProps.meta_data}
      // preview={pageProps.preview}
    >
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
