import type { MetadataRoute } from 'next';
import config from '@/config';

/**
 * Publicly indexable routes. Keep this in sync with the `disallow` list in
 * app/robots.ts — anything reachable without signing in belongs here.
 */
const PUBLIC_ROUTES = [
  { path: '/', changeFrequency: 'weekly' as const, priority: 1 },
  { path: '/our-story', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/how-to-use', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/safety', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/community-guidelines', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/privacy-policy', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/tos', changeFrequency: 'yearly' as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = `https://${config.domainName}`;
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
