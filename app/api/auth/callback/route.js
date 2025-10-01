import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(new URL("/signin?error=" + encodeURIComponent(error), requestUrl.origin));
  }

  if (code) {
    const supabase = createClient();
    
    try {
      // Exchange the code for a session and wait for it to complete
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("Session exchange error:", exchangeError);
        return NextResponse.redirect(new URL("/signin?error=session_exchange_failed", requestUrl.origin));
      }

      // Verify the session was created successfully
      if (!data.session) {
        console.error("No session created after code exchange");
        return NextResponse.redirect(new URL("/signin?error=no_session", requestUrl.origin));
      }

      console.log("Session created successfully for user:", data.user?.id);
      
      // Send welcome email for new users
      try {
        console.log('🔍 Debug: Checking for new user:', data.user.email, 'Created at:', data.user.created_at);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        console.log('🔍 Debug: Profile lookup result:', { profile: !!profile, error: profileError?.message });
          
        if (!profileError && profile) {
          // Check if this is a new user (created within last 5 minutes)
          const userCreatedAt = new Date(data.user.created_at);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          
          console.log('🔍 Debug: User created at:', userCreatedAt, 'Five minutes ago:', fiveMinutesAgo, 'Is new user:', userCreatedAt > fiveMinutesAgo);
          
          // Check if this is a new user (created within last 5 minutes)
          if (userCreatedAt > fiveMinutesAgo) {
            console.log('📧 Debug: Attempting to send welcome email...');
            
            // Send welcome email
            const emailResponse = await fetch(`${requestUrl.origin}/api/emails/welcome`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: data.user.id })
            });
            
            const emailResult = await emailResponse.json();
            console.log('📧 Debug: Welcome email response:', emailResult);
            
            if (emailResponse.ok) {
              console.log('✅ Welcome email sent successfully to:', data.user.email);
            } else {
              console.error('❌ Welcome email failed:', emailResult);
            }
          } else {
            console.log('⏰ Debug: User is not new (created more than 5 minutes ago)');
          }
        } else {
          console.log('❌ Debug: Profile not found or error:', profileError?.message);
        }
      } catch (emailError) {
        console.error('❌ Error in welcome email process:', emailError);
        // Don't fail the login process if email fails
      }
    } catch (error) {
      console.error("Unexpected error during session exchange:", error);
      return NextResponse.redirect(new URL("/signin?error=unexpected_error", requestUrl.origin));
    }
  }

  // URL to redirect to after sign in process completes
  // Always use the production domain for consistency
  const origin = `https://${config.domainName}`;
  const redirectUrl = origin + config.auth.callbackUrl;
  
  console.log("Redirecting to:", redirectUrl);
  
  return NextResponse.redirect(redirectUrl);
}
