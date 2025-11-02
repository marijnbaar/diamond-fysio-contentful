module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['www.instagram.com', 'images.ctfassets.net', 'instagram.com']
  },
  i18n: {
    locales: ['nl', 'en'],
    defaultLocale: 'nl',
    localeDetection: false
  },
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/images/logogrijs.png',
        permanent: true
      }
    ];
  }
};
