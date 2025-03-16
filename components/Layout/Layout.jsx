import Head from 'next/head';
import Navigation from './Navigation';
// import PreviewBar from './PreviewBar';
import Footer from './Footer';

// preview, navigation
const Layout = ({ footer, meta, children, navigation }) => {
  return (
    <>
      <Head>
        {meta && meta[0] ? (
          <>
            <title>{meta[0].meta_titel}</title>
            <meta name="description" content={meta[0].meta_description} />
          </>
        ) : null}
        <link rel="icon" href="/images/logogrijs.png" />
      </Head>
      {navigation ? <Navigation navigation={navigation} /> : null}
      <main>{children}</main>
      {footer ? <footer>{<Footer footer={footer} />}</footer> : null}
    </>
  );
};

export default Layout;
