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
