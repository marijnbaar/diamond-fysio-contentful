import '../styles/globals.css';
import Layout from '../components/Layout/Layout';
import CookieConsent from 'react-cookie-consent';
import Link from 'next/link';

function MyApp({ Component, pageProps }) {
  return (
    <Layout
      navigation={pageProps.navigation}
      footer={pageProps.footer}
      // meta={pageProps.meta_data}
      // preview={pageProps.preview}
    >
      <Component {...pageProps} />
      <CookieConsent
        debug={true}
        style={{ padding: '0px 240px ', background: 'white', color: 'rgb(107 114 128 )' }}
        buttonStyle={{
          color: 'white',
          backgroundColor: 'rgb(20 184 166)',
          marginTop: '20px',
          padding: '12px 32px',
          borderRadius: '0.25rem'
        }}
        buttonText="Accepteren"
        textStyle={{ marginTop: '20px' }}
      >
        <p>
          Deze site gebruikt cookies om de gebruikservaring te optimaliseren en webverkeer te
          analyseren.{' '}
          <Link href="/privacy-policy">
            <a className="text-gray-400 hover:text-beige">Lees hier meer</a>
          </Link>{' '}
          over hoe wij cookies gebruiken. Ga je akkoord met het gebruik van cookies? Klik dan op
          &quot;Accepteren&quot;.
        </p>
      </CookieConsent>
    </Layout>
  );
}

export default MyApp;
