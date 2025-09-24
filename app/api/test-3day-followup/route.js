import { createClient } from '@/libs/supabase/server';
import { sendFollowUp3DaysEmail } from '@/libs/emailTemplates';

export async function GET() {
  try {
    const supabase = createClient();

    // Get a test user (you can modify this to target specific users)
    const { data: testUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .limit(1)
      .single();

    if (userError || !testUser) {
      return Response.json({ 
        error: 'No test user found. Please ensure you have at least one user in the database.' 
      }, { status: 404 });
    }

    // Send test 3-day follow-up email
    await sendFollowUp3DaysEmail({
      to: testUser.email,
      userName: testUser.first_name || 'there',
    });

    return Response.json({
      success: true,
      message: `Test 3-day follow-up email sent to ${testUser.email}`,
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.first_name
      }
    });

  } catch (error) {
    console.error('Error sending test 3-day follow-up email:', error);
    return Response.json(
      { error: 'Failed to send test email' }, 
      { status: 500 }
    );
  }
}
