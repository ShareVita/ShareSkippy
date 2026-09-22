import { getSEOTags } from '@/libs/seo';

// The page itself is a client component (interactive filters and accordions),
// so its metadata lives here in the route's layout.
export const metadata = getSEOTags({
  title: 'ShareSkippy FAQ: How Free Dog Sharing Works',
  description:
    'Answers about how ShareSkippy works, what it costs, how meetings are arranged, and how the community stays safe.',
  keywords: ['ShareSkippy FAQ', 'dog sharing questions', 'how does dog sharing work'],
  canonicalUrlRelative: '/faq',
});

export default function Layout({ children }) {
  return <>{children}</>;
}
