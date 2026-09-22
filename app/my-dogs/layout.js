import { getSEOTags } from '@/libs/seo';

// Signed-in application surface: give it a distinct title, but keep it out of
// search results.
export const metadata = getSEOTags({
  title: 'My Dogs | ShareSkippy',
  description: 'Manage the dogs you share on ShareSkippy.',
  extraTags: { robots: { index: false, follow: false } },
});

export default async function MyDogsLayout({ children }) {
  return <>{children}</>;
}
