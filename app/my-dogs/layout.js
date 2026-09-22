import { getSEOTags } from '@/libs/seo';

// Signed-in application surface. It renders only the nav shell to a logged-out
// crawler, so keep it out of the index; nested routes inherit this.
export const metadata = getSEOTags({
  title: 'My Dogs | ShareSkippy',
  description: 'Manage the dogs on your ShareSkippy account.',
  extraTags: { robots: { index: false, follow: false } },
});

export default async function MyDogsLayout({ children }) {
  return <>{children}</>;
}
