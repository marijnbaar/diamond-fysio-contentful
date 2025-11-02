import Head from 'next/head';
import Navigation from './Navigation';
import Footer from './Footer';

// preview, navigation
const Layout = ({ footer, meta, children, navigation }) => {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://images.ctfassets.net" crossOrigin="anonymous" />
        {meta && meta[0] ? (
          <>
            <title>{meta[0].meta_titel}</title>
            <meta name="description" content={meta[0].meta_description} />
            <meta property="og:title" content={meta[0].meta_titel} />
            <meta property="og:description" content={meta[0].meta_description} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="/images/logo.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={meta[0].meta_titel} />
            <meta name="twitter:description" content={meta[0].meta_description} />
          </>
        ) : (
          <>
            <title>Diamond Fysio Amsterdam</title>
            <meta
              name="description"
              content="Professionele fysiotherapie in Amsterdam met specialismen in sport en dans. Vergoed door verzekeraars. Maak eenvoudig online een afspraak."
            />
            <meta property="og:title" content="Diamond Fysio Amsterdam" />
            <meta
              property="og:description"
              content="Professionele fysiotherapie in Amsterdam met specialismen in sport en dans. Vergoed door verzekeraars."
            />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="/images/logo.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Diamond Fysio Amsterdam" />
            <meta
              name="twitter:description"
              content="Professionele fysiotherapie in Amsterdam. Maak eenvoudig online een afspraak."
            />
          </>
        )}
        <link rel="icon" href="/images/logogrijs.png" />
      </Head>
      {navigation ? <Navigation navigation={navigation} /> : null}
      <main className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        {children}
      </main>
      {footer ? <footer>{<Footer footer={footer} />}</footer> : null}
    </>
  );
};

export default Layout;
