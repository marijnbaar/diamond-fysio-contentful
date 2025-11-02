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

MyApp.getInitialProps = async (appContext) => {
  // Call page's getInitialProps if it exists
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  // If this is a 404 page, fetch navigation and footer server-side
  const componentName = appContext.Component.displayName || appContext.Component.name;
  if (componentName === 'FourOhFour') {
    const { getNavigation, getFooter } = await import('../lib/query/getData');
    const { normalizeLocale } = await import('../lib/helpers/normalizeLocale');
    const locale = appContext.router?.locale || 'nl';
    const cfLocale = normalizeLocale(locale) || undefined;

    try {
      const [navigation, footer] = await Promise.all([
        getNavigation(false, cfLocale),
        getFooter(false, cfLocale)
      ]);

      return {
        pageProps: {
          ...pageProps,
          navigation,
          footer,
          slug: '/404',
          meta: null
        }
      };
    } catch {
      // Return empty props if fetch fails
      return {
        pageProps: {
          ...pageProps,
          slug: '/404',
          meta: null
        }
      };
    }
  }

  // For other pages, return pageProps as-is
  return { pageProps };
};

export default MyApp;
