import '../styles/globals.css';
import Layout from '../components/Layout/Layout';
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const [cookieConsent, setCookieConsent] = useState(getCookieConsentValue());
  useEffect(() => {
    setCookieConsent(getCookieConsentValue());
  }, []);

  return (
    <Layout
      navigation={pageProps.navigation}
      footer={pageProps.footer}
      // meta={pageProps.meta_data}
      // preview={pageProps.preview}
    >
      <Component {...pageProps} />
      {!cookieConsent && (
        <CookieConsent
          onAccept={() => {
            setCookieConsent(true);
          }}
          debug={true}
          style={{ padding: '10px', background: 'white', color: 'rgb(107 114 128 )' }}
          buttonStyle={{
            color: 'white',
            backgroundColor: 'rgb(20 184 166)',
            marginTop: '10px',
            padding: '12px 32px',
            borderRadius: '0.25rem'
          }}
          buttonText="Accepteren"
          textStyle={{ marginTop: '20px' }}
        >
          <p>
            Deze site gebruikt cookies om de gebruikservaring te optimaliseren en webverkeer te
            analyseren.
            <Link href="/privacy-policy" className="text-gray-400 hover:text-beige">
              {' '}
              Lees hier meer{' '}
            </Link>
            over hoe wij cookies gebruiken. Ga je akkoord met het gebruik van cookies? Klik dan op
            &quot;Accepteren&quot;.
          </p>
        </CookieConsent>
      )}
    </Layout>
  );
}

export default MyApp;
