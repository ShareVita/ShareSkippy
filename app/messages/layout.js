import React from 'react';

import { getSEOTags } from '@/libs/seo';

// Signed-in application surface. It renders only the nav shell to a logged-out
// crawler, so keep it out of the index; nested routes inherit this.
export const metadata = getSEOTags({
  title: 'Messages | ShareSkippy',
  description: 'Your ShareSkippy messages.',
  extraTags: { robots: { index: false, follow: false } },
});

export default async function MessagesLayout({ children }) {
  return <>{children}</>;
}
