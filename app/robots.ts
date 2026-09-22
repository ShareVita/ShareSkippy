import type { MetadataRoute } from 'next';
import config from '@/config';

/**
 * robots.txt, served by Next itself.
 *
 * This replaces the `next-sitemap` postbuild step, whose default `siteUrl`
 * was still the boilerplate's domain — the deployed robots.txt was pointing
 * crawlers at shipfa.st instead of ShareSkippy.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = `https://${config.domainName}`;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Signed-in application surfaces: nothing here is useful in search
        // results and some of it is per-user.
        disallow: [
          '/api/',
          '/admin',
          '/messages',
          '/meetings',
          '/my-dogs',
          '/profile',
          '/onboarding',
          '/share-availability',
          '/signin',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
