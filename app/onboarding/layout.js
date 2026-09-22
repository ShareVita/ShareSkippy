import PropTypes from 'prop-types';
import { getSEOTags } from '@/libs/seo';

// Signed-in onboarding flow. Keep it out of the index; nested routes inherit this.
export const metadata = getSEOTags({
  title: 'Welcome | ShareSkippy',
  description: 'Get started on ShareSkippy.',
  extraTags: { robots: { index: false, follow: false } },
});

export default function OnboardingLayout({ children }) {
  return <>{children}</>;
}

OnboardingLayout.propTypes = {
  children: PropTypes.node,
};
