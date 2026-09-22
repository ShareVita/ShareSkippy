import React from 'react';

import { getSEOTags } from '@/libs/seo';

// Signed-in application surface. It renders only the nav shell to a logged-out
// crawler, so keep it out of the index; nested routes inherit this.
export const metadata = getSEOTags({
  title: 'Meetings | ShareSkippy',
  description: 'Your scheduled ShareSkippy meetings.',
  extraTags: { robots: { index: false, follow: false } },
});

export default async function MeetingsLayout({ children }) {
  return <>{children}</>;
}
