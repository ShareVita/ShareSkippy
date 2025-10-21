import { redirect } from 'next/navigation';
import config from '@/config';
import { createClient } from '@/libs/supabase/server';

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
export default async function ProfileLayout({ children }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  return <>{children}</>;
}
