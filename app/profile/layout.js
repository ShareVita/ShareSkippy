import React from 'react';

import { getSEOTags } from '@/libs/seo';

// Signed-in application surface. It renders only the nav shell to a logged-out
// crawler, so keep it out of the index; nested routes inherit this.
export const metadata = getSEOTags({
  title: 'Your Profile | ShareSkippy',
  description: 'Your ShareSkippy profile.',
  extraTags: { robots: { index: false, follow: false } },
});

export default async function ProfileLayout({ children }) {
  return <>{children}</>;
}
