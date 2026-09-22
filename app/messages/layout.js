import React from 'react';
import { getSEOTags } from '@/libs/seo';

// Signed-in application surface: give it a distinct title, but keep it out of
// search results.
export const metadata = getSEOTags({
  title: 'Messages | ShareSkippy',
  description: 'Your ShareSkippy conversations.',
  extraTags: { robots: { index: false, follow: false } },
});

export default async function MessagesLayout({ children }) {
  return <>{children}</>;
}
