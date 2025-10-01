import { sendWelcomeEmail } from '@/libs/emailTemplates';
import { createClient } from '@/libs/supabase/server';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user data from Supabase
    const supabase = createClient();
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Send welcome email
    await sendWelcomeEmail({
      to: user.email,
      userName: user.first_name || 'there',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'shareskippy.com',
      userId: userId,
    });

    return Response.json({ 
      success: true, 
      message: 'Welcome email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return Response.json(
      { error: 'Failed to send welcome email' }, 
      { status: 500 }
    );
  }
}

