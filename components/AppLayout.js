'use client';

import { usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useUser } from '@/components/providers/SupabaseUserProvider';
import Footer from './Footer';
import Header from './Header';
import LoggedInNav from './LoggedInNav';
import ReviewBanner from './ReviewBanner';
import ReviewModal from './ReviewModal';

const AppLayout = ({ children }) => {
  // NOTE: intentionally not gating this subtree on `loading`. Doing so made the
  // server response for every route render only "Loading...", so crawlers saw no
  // page content. `user` is null until auth resolves, which renders the same
  // logged-out chrome the server would render anyway.
  const { user } = useUser();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const pathname = usePathname();

  // Don't show header/footer on auth pages
  const isAuthPage = pathname === '/signin' || pathname.startsWith('/signin');

  const handleReviewClick = useCallback((review) => {
    setSelectedReview(review);
    setIsReviewModalOpen(true);
  }, []);

  const handleReviewSubmitted = useCallback((review) => {
    // The review submission will be handled by the specific page components
    // that use React Query to invalidate their caches
    console.log('Review submitted:', review);
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    setIsReviewModalOpen(false);
    setSelectedReview(null);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Show appropriate header based on authentication status */}
      {!isAuthPage && (user ? <LoggedInNav /> : <Header />)}

      {/* Main content */}
      <main className="flex-1 w-full bg-white">
        {/* Show review banner for logged-in users */}
        {user && !isAuthPage && (
          <div className="container mx-auto px-4 pt-4">
            <ReviewBanner onReviewClick={handleReviewClick} />
          </div>
        )}
        {children}
      </main>

      {/* Show footer on all pages except auth pages */}
      {!isAuthPage && <Footer />}

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        pendingReview={selectedReview}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default AppLayout;
