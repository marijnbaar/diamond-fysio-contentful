module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.instagram.com'
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net'
      },
      {
        protocol: 'https',
        hostname: 'instagram.com'
      }
    ],
    qualities: [75]
  },
  // Note: i18n config is for Pages Router only, not App Router
  // If using App Router, use different internationalization approach
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
