'use client';

import { useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';
import { useRouter } from 'next/navigation';
import config from '@/config';
import { getSEOTags } from '@/libs/seo';

export const metadata = getSEOTags({
  title: `Sign-in to ${config.appName}`,
  canonicalUrlRelative: '/auth/signin',
});

export default function Layout({ children }) {
  const supabase = createClient();
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

  return <>{children}</>;
}
