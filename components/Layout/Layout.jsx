import Head from 'next/head';
import Menu from '../Menu';
// import PreviewBar from './PreviewBar';
// import Navigation from './Navigation';
// import Footer from './Footer';
// preview, navigation
const Layout = ({ footer, meta, children }) => {
  return (
    <>
      <Head>
        {meta && meta[0] ? (
          <>
            <title>{meta[0].meta_titel}</title>
            <meta name="description" content={meta[0].meta_description} />
          </>
        ) : null}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* {navigation ? <Menu /> : null} */}
      <Menu />
      <main>{children}</main>
      {footer ? <footer>{/* <Footer footer={footer} />{' '} */}</footer> : null}
    </>
  );
};

export default Layout;
