import { redirect } from 'next/navigation';
import config from '@/config';
import { createClient } from '@/libs/supabase/server';

export default async function CommunityLayout({ children }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Temporarily allow unauthenticated access for testing
  // if (!user) {
  //   redirect(config.auth.loginUrl);
  // }

  return <>{children}</>;
}
