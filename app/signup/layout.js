import config from '@/config';
import { getSEOTags } from '@/libs/seo';

export const metadata = getSEOTags({
  title: `Sign up for ${config.appName}`,
  canonicalUrlRelative: '/signup',
});

export default function Layout({ children }) {
  return <>{children}</>;
}
