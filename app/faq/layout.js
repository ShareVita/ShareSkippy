import { getSEOTags } from '@/libs/seo';
import PropTypes from 'prop-types';

// The FAQ page itself is a client component (it holds accordion state), and
// client components cannot export metadata. This layout carries it instead.
export const metadata = getSEOTags({
  title: 'Frequently Asked Questions | ShareSkippy',
  description:
    'Answers to common questions about ShareSkippy: how free dog sharing works, how members are verified, and how to get started.',
  canonicalUrlRelative: '/faq',
});

export default function FaqLayout({ children }) {
  return children;
}

FaqLayout.propTypes = {
  children: PropTypes.node,
};
