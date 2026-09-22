import { getSEOTags } from '@/libs/seo';

// Signed-in application surface: give it a distinct title, but keep it out of
// search results.
export const metadata = getSEOTags({
  title: 'Welcome | ShareSkippy',
  description: 'Get your ShareSkippy profile set up.',
  extraTags: { robots: { index: false, follow: false } },
});

export default function Layout({ children }) {
  return <>{children}</>;
}
