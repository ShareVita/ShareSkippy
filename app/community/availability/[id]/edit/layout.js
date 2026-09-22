import { getSEOTags } from '@/libs/seo';

// Signed-in application surface: give it a distinct title, but keep it out of
// search results.
export const metadata = getSEOTags({
  title: 'Edit Availability Post | ShareSkippy',
  description: 'Edit a ShareSkippy availability post.',
  extraTags: { robots: { index: false, follow: false } },
});

export default function Layout({ children }) {
  return <>{children}</>;
}
