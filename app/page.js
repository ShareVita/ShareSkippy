import LandingPage from '@/components/landing/LandingPage';
import { getSEOTags } from '@/libs/seo';

export const metadata = getSEOTags({
  title: 'ShareSkippy: Free Dog Sharing in Your Neighborhood',
  description:
    'ShareSkippy connects dog owners with dog lovers for free walks, hikes, cuddles, and adventures. Dogs get exercise and love, humans get companionship, neighborhoods grow stronger.',
  keywords: ['dog sharing', 'borrow a dog', 'free dog walking', 'dog lovers', 'ShareSkippy'],
  canonicalUrlRelative: '/',
  openGraph: {
    title: 'Happy Dogs. Happy Humans. Happier Neighborhoods.',
    description:
      'A free, community-driven way to connect dog owners with dog lovers for walks, hikes, and adventures.',
  },
});

/**
 * Home route. This is a server component so the page can carry its own
 * metadata; all of the interactive landing-page markup lives in the client
 * component below.
 */
export default function Home() {
  return <LandingPage />;
}
