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
      
      // Extract Google user metadata for name pre-filling
      try {
        const userMetadata = data.user?.user_metadata || {};
        const googleName = userMetadata?.full_name || userMetadata?.name;
        const googleGivenName = userMetadata?.given_name || userMetadata?.first_name;
        const googleFamilyName = userMetadata?.family_name || userMetadata?.last_name;
        const googlePicture = userMetadata?.picture || userMetadata?.avatar_url;
        
        console.log('🔍 Debug: Google user metadata:', {
          full_name: googleName,
          given_name: googleGivenName,
          family_name: googleFamilyName,
          picture: googlePicture
        });
        
        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        console.log('🔍 Debug: Profile lookup result:', { profile: !!existingProfile, error: profileError?.message });
        
        // If profile doesn't exist, create it with Google data
        if (profileError && profileError.code === 'PGRST116') {
          console.log('📝 Creating new profile with Google data...');
          
          const profileData = {
            id: data.user.id,
            email: data.user.email,
            first_name: googleGivenName || '',
            last_name: googleFamilyName || '',
            profile_photo_url: googlePicture || null
          };
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();
            
          if (createError) {
            console.error('❌ Error creating profile:', createError);
          } else {
            console.log('✅ Profile created with Google data:', newProfile);
          }
        } else if (existingProfile) {
          // Update existing profile with Google data if name fields are empty
          const updateData = {};
          let needsUpdate = false;
          
          if (!existingProfile.first_name && googleGivenName) {
            updateData.first_name = googleGivenName;
            needsUpdate = true;
          }
          
          if (!existingProfile.last_name && googleFamilyName) {
            updateData.last_name = googleFamilyName;
            needsUpdate = true;
          }
          
          if (!existingProfile.profile_photo_url && googlePicture) {
            updateData.profile_photo_url = googlePicture;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            console.log('📝 Updating existing profile with Google data...');
            
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', data.user.id)
              .select()
              .single();
              
            if (updateError) {
              console.error('❌ Error updating profile:', updateError);
            } else {
              console.log('✅ Profile updated with Google data:', updatedProfile);
            }
          }
        }
      } catch (metadataError) {
        console.error('❌ Error processing Google metadata:', metadataError);
        // Don't fail the login process if metadata processing fails
      }
      
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
            
            // Send welcome email using new centralized system
            const emailResponse = await fetch(`${requestUrl.origin}/api/emails/send-welcome`, {
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
  // For new users, redirect to profile edit; for existing users, redirect to callback URL
  const origin = requestUrl.origin;
  
  // Check if this is a new user by checking if profile has required fields
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, role, phone_number')
        .eq('id', user.id)
        .single();
      
      // If profile is incomplete (missing role or phone), redirect to profile edit
      const isIncomplete = !profile || !profile.role?.trim() || !profile.phone_number?.trim();
      
      if (isIncomplete) {
        console.log("New/incomplete user - Redirecting to profile edit");
        return NextResponse.redirect(origin + "/profile/edit");
      }
    }
  } catch (err) {
    console.error("Error checking profile completeness:", err);
  }
  
  console.log("Existing user - Redirecting to:", config.auth.callbackUrl);
  return NextResponse.redirect(origin + config.auth.callbackUrl);
}
