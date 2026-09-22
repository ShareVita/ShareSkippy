import config from '@/config';
import { getSEOTags } from '@/libs/seo';

export const metadata = getSEOTags({
  title: `Sign-in to ${config.appName}`,
  canonicalUrlRelative: '/signin',
  extraTags: { robots: { index: false, follow: false } },
});

export default function Layout({ children }) {
  return <>{children}</>;
}
