import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from './Navigation';
import Footer from './Footer';

// preview, navigation
const Layout = ({ footer, meta, children, navigation, slug }) => {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fysiodiamondfactory.nl';
  const currentPath = router.asPath || slug || '/';
  const canonicalUrl = `${siteUrl}${currentPath === '/' ? '' : currentPath}`;
  const locale = router.locale || 'nl';
  const alternateLocale = locale === 'nl' ? 'en' : 'nl';
  const localePath = locale === 'nl' ? '' : `/${locale}`;
  const alternateLocalePath = alternateLocale === 'nl' ? '' : `/${alternateLocale}`;

  // Get meta data or defaults
  const title = meta && meta[0] ? meta[0].meta_titel : 'Diamond Fysio Amsterdam';
  const description =
    meta && meta[0]
      ? meta[0].meta_description
      : 'Professionele fysiotherapie in Amsterdam met specialismen in sport en dans. Vergoed door verzekeraars. Maak eenvoudig online een afspraak.';
  const ogImage = `${siteUrl}/images/logo.jpg`;

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://images.ctfassets.net" crossOrigin="anonymous" />
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <meta name="language" content={locale === 'nl' ? 'Dutch' : 'English'} />
        <meta name="theme-color" content="#14b8a6" />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Hreflang tags for locale alternates */}
        <link rel="alternate" hrefLang={locale} href={`${siteUrl}${localePath}${currentPath}`} />
        <link
          rel="alternate"
          hrefLang={alternateLocale}
          href={`${siteUrl}${alternateLocalePath}${currentPath}`}
        />
        <link rel="alternate" hrefLang="x-default" href={`${siteUrl}${currentPath}`} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content={locale === 'nl' ? 'nl_NL' : 'en_US'} />
        <meta property="og:site_name" content="Diamond Fysio Amsterdam" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        <link rel="icon" href="/images/logogrijs.png" />
      </Head>
      {navigation ? <Navigation navigation={navigation} /> : null}
      <main className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        {children}
      </main>
      {footer ? <footer>{<Footer footer={footer} />}</footer> : null}

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Physiotherapy',
            name: 'Diamond Fysio Amsterdam',
            description: description,
            url: siteUrl,
            telephone: '+31 20 XXX XXXX', // Update with actual phone number
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Straatnaam', // Update with actual address
              addressLocality: 'Amsterdam',
              postalCode: 'XXXX XX',
              addressCountry: 'NL'
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: '52.3676', // Update with actual coordinates
              longitude: '4.9041'
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:00',
                closes: '18:00'
              }
            ],
            priceRange: '€€',
            areaServed: {
              '@type': 'City',
              name: 'Amsterdam'
            },
            medicalSpecialty: ['Physical Therapy', 'Sports Medicine', 'Dance Medicine']
          })
        }}
      />
    </>
  );
};

export default Layout;
