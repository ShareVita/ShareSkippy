import React from 'react';
import { getSEOTags } from '@/libs/seo';

// Signed-in application surface: give it a distinct title, but keep it out of
// search results.
export const metadata = getSEOTags({
  title: 'Share Availability | ShareSkippy',
  description: 'Post when your dog is available to share.',
  extraTags: { robots: { index: false, follow: false } },
});

export default async function ShareAvailabilityLayout({ children }) {
  return <>{children}</>;
}
