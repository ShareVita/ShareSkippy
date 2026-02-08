import { createClient } from '@/libs/supabase/server';
import crypto from 'crypto';

// Helper to decode base64url
const base64UrlDecode = (s) => {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64').toString('utf8');
};

export async function GET(request) {
  try {
    const url = new URL(request.url);

    const token = url.searchParams.get('t');
    let email = url.searchParams.get('email');

    // If token provided, validate it and extract the email
    if (token) {
      try {
        const secret = process.env.UNSUBSCRIBE_SECRET;
        if (!secret) throw new Error('No UNSUBSCRIBE_SECRET configured');

        const [payloadB64, sigB64] = token.split('.');
        if (!payloadB64 || !sigB64) throw new Error('Invalid token');

        const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest();
        const providedSig = Buffer.from(sigB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

        if (
          expectedSig.length !== providedSig.length ||
          !crypto.timingSafeEqual(expectedSig, providedSig)
        ) {
          throw new Error('Invalid token signature');
        }

        const payloadJson = base64UrlDecode(payloadB64);
        const payload = JSON.parse(payloadJson);

        if (!payload.email) throw new Error('Token missing email');
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) throw new Error('Token expired');

        email = payload.email;
      } catch (err) {
        console.error('Invalid unsubscribe token:', err.message || err);
        // Continue — do not reveal details to the requester
      }
    }

    if (!email) {
      return new Response('Missing email or token', { status: 400 });
    }

    try {
      const supabase = await createClient('service_role');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profile && profile.id) {
        await supabase
          .from('user_settings')
          .update({ email_notifications: false })
          .eq('user_id', profile.id);
      }
    } catch (err) {
      console.error('Unsubscribe processing error:', err);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${appUrl.replace(/\/$/, '')}/unsubscribe/confirmed?email=${encodeURIComponent(email)}`;
    return Response.redirect(redirectUrl, 302);
  } catch (err) {
    console.error('Unsubscribe route error:', err);
    return new Response('Server error', { status: 500 });
  }
}
