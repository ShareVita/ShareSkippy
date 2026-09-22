import React from 'react';

import { getSEOTags } from '@/libs/seo';

// Signed-in application surface. It renders only the nav shell to a logged-out
// crawler, so keep it out of the index; nested routes inherit this.
export const metadata = getSEOTags({
  title: 'Share Availability | ShareSkippy',
  description: 'Share when you are available.',
  extraTags: { robots: { index: false, follow: false } },
});

export default async function ShareAvailabilityLayout({ children }) {
  return <>{children}</>;
}
