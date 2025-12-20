// Disable image optimization when SKIP_CONTENTFUL is enabled
// This allows images to be served directly (potentially from Vercel edge cache)
const skipContentful = process.env.SKIP_CONTENTFUL === 'true';

module.exports = {
  reactStrictMode: true,
  images: {
    // When Contentful is blocked, skip optimization so images load directly
    unoptimized: skipContentful,
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
    // Allow the quality values used across the site
    qualities: [70, 75, 85, 100]
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
