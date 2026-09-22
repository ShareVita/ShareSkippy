// Every route in this app is server-rendered on demand, so next-sitemap's
// automatic discovery (which reads the build manifest for static pages) finds
// nothing and previously emitted a sitemap containing a single icon PNG.
// The public, indexable routes are therefore listed explicitly here.
//
// Deliberately omitted:
//   - auth-gated routes (/community, /profile, /messages, /my-dogs, /meetings,
//     /share-availability, /onboarding, /admin) — they render only the nav
//     shell to a logged-out crawler, so indexing them creates thin pages
//   - /signin and /signup — functional, no search value
const PUBLIC_ROUTES = [
  '/',
  '/our-story',
  '/how-to-use',
  '/faq',
  '/safety',
  '/community-guidelines',
  '/privacy-policy',
  '/tos',
];

module.exports = {
  // The canonical origin for this site. Used for sitemap.xml and robots.txt.
  siteUrl: process.env.SITE_URL || 'https://www.shareskippy.com',
  generateRobotsTxt: true,
  // Next.js App Router metadata files are image routes, not pages.
  exclude: ['/twitter-image.*', '/opengraph-image.*', '/icon.*', '/apple-icon.*'],
  additionalPaths: async (config) =>
    Promise.all(PUBLIC_ROUTES.map((route) => config.transform(config, route))),
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        // API routes and the admin surface have nothing to index.
        disallow: ['/api/', '/admin/'],
      },
    ],
  },
};
