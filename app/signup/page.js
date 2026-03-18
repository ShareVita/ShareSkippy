'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';
import toast from 'react-hot-toast';
import config from '@/config';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Signup() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push('/community');
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  // Handle error messages from OAuth callback
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      let errorMessage = 'Sign-up failed. Please try again.';

      switch (error) {
        case 'session_exchange_failed':
          errorMessage = 'Failed to establish session. Please try signing up again.';
          break;
        case 'no_session':
          errorMessage = 'Session not created. Please try signing up again.';
          break;
        case 'unexpected_error':
          errorMessage = 'An unexpected error occurred. Please try again.';
          break;
        default:
          errorMessage = `Sign-up error: ${error}`;
      }

      toast.error(errorMessage);
    }
  }, [searchParams]);

  const handleSignup = async (e, options) => {
    e?.preventDefault();

    setIsLoading(true);

    try {
      const { type, provider } = options;
      const redirectURL = window.location.origin + '/api/auth/callback';

      if (type === 'oauth') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectURL,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
              scope: 'openid profile email',
            },
          },
        });

        if (error) {
          console.error('OAuth sign-up error:', error);
          toast.error('Failed to sign up with Google. Please try again.');
        }
      } else if (type === 'magic_link') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectURL,
          },
        });

        if (error) {
          console.error('Magic link error:', error);
          toast.error('Failed to send magic link. Please try again.');
        } else {
          toast.success('Check your emails!');
          setIsDisabled(true);
        }
      }
    } catch (error) {
      console.error('Unexpected sign-up error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex" data-theme="light">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #f79533 0%, #ef4e7b 30%, #a166ab 55%, #5073b8 75%, #07b39b 100%)',
        }}
      >
        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium w-fit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to home
        </Link>

        {/* Brand content */}
        <div className="space-y-6">
          <div className="text-6xl">🐾</div>
          <h1 className="text-4xl font-extrabold leading-tight text-white">
            Join thousands of dog lovers in your neighborhood
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Whether you own a pup or just love dogs, ShareSkippy connects you with your community
            for walks, playdates, and puppy therapy — completely free.
          </p>

          {/* Benefits list */}
          <div className="space-y-3 pt-2">
            {[
              { icon: '🐶', text: 'Borrow a dog for the afternoon — 100% joy, 0% vet bills' },
              { icon: '🏃', text: 'Owners get reliable walkers when life gets busy' },
              { icon: '🏡', text: 'Build real connections with your neighbors' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white/15 backdrop-blur-sm rounded-xl p-3.5 border border-white/20"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-white/90 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="text-white/40 text-xs">
          © {new Date().getFullYear()} ShareSkippy · 501(c)(3) Nonprofit
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-white">
        {/* Mobile back link */}
        <div className="w-full max-w-md mb-6 lg:hidden">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="text-3xl mb-3 lg:hidden">🐾</div>
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-500 mt-1">Join {config.appName} — it&apos;s free</p>
          </div>

          {/* Google OAuth */}
          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow"
            onClick={(e) => handleSignup(e, { type: 'oauth', provider: 'google' })}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Magic link form */}
          <form className="space-y-4" onSubmit={(e) => handleSignup(e, { type: 'magic_link' })}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                required
                type="email"
                value={email}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(90deg, #f79533, #ef4e7b, #a166ab)' }}
              disabled={isLoading || isDisabled}
              type="submit"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              )}
              {isDisabled ? 'Check your inbox ✓' : 'Send Magic Link'}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/signin" className="font-semibold text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our{' '}
            <Link href="/tos" className="underline hover:text-gray-600">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="underline hover:text-gray-600">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
