import { getSEOTags } from '@/libs/seo';

// Signed-in application surface: give it a distinct title, but keep it out of
// search results.
export const metadata = getSEOTags({
  title: 'Dog Profile | ShareSkippy',
  description: 'A dog profile on ShareSkippy.',
  extraTags: { robots: { index: false, follow: false } },
});

export default function Layout({ children }) {
  return <>{children}</>;
}
