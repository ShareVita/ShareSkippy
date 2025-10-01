import { createServiceClient } from '@/libs/supabase/server';
import { sendFollowUp3DaysEmail } from '@/libs/emailTemplates';

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Get users who signed up exactly 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);
    
    const twoDaysAgo = new Date(threeDaysAgo);
    twoDaysAgo.setDate(twoDaysAgo.getDate() + 1);

    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, created_at')
      .gte('created_at', threeDaysAgo.toISOString())
      .lt('created_at', twoDaysAgo.toISOString());

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    let emailsSent = 0;
    const errors = [];

    // Send 3-day follow-up emails to each user
    for (const user of users || []) {
      try {
        // Check if user has email notifications enabled
        const { data: settings } = await supabase
          .from('user_settings')
          .select('email_notifications, follow_up_3day_sent')
          .eq('user_id', user.id)
          .single();

        if (settings && !settings.email_notifications) {
          continue; // Skip users who have disabled email notifications
        }

        // Skip if 3-day follow-up already sent
        if (settings && settings.follow_up_3day_sent) {
          continue;
        }

        // Send 3-day follow-up email
        await sendFollowUp3DaysEmail({
          to: user.email,
          userName: user.first_name || 'there',
          userId: user.id,
        });

        emailsSent++;

        // Mark that 3-day follow-up was sent
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            follow_up_3day_sent: true,
            follow_up_3day_sent_at: new Date().toISOString()
          });

      } catch (error) {
        console.error(`Error sending 3-day follow-up email to user ${user.id}:`, error);
        errors.push({
          userId: user.id,
          email: user.email,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `3-day follow-up emails processed`,
      emailsSent,
      usersProcessed: users?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in 3-day follow-up emails cron job:', error);
    return Response.json(
      { error: 'Failed to process 3-day follow-up emails' }, 
      { status: 500 }
    );
  }
}
