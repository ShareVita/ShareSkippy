module.exports = {
  // The canonical origin for this site. Used for sitemap.xml and robots.txt.
  siteUrl: process.env.SITE_URL || 'https://www.shareskippy.com',
  generateRobotsTxt: true,
  // use this to exclude routes from the sitemap (i.e. a user dashboard). By default, NextJS app router metadata files are excluded (https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
  exclude: ['/twitter-image.*', '/opengraph-image.*', '/icon.*'],
};
