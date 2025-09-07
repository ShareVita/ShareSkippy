import { createClient } from '@/libs/supabase/server';
import { sendFollowUpEmail } from '@/libs/emailTemplates';

export async function GET() {
  try {
    const supabase = createClient();

    // Get users who signed up exactly 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const sixDaysAgo = new Date(sevenDaysAgo);
    sixDaysAgo.setDate(sixDaysAgo.getDate() + 1);

    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .lt('created_at', sixDaysAgo.toISOString());

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    let emailsSent = 0;
    const errors = [];

    // Send follow-up emails to each user
    for (const user of users || []) {
      try {
        // Check if user has email notifications enabled
        const { data: settings } = await supabase
          .from('user_settings')
          .select('email_notifications')
          .eq('user_id', user.id)
          .single();

        if (settings && !settings.email_notifications) {
          continue; // Skip users who have disabled email notifications
        }

        // Get user's first dog name
        const { data: userDog } = await supabase
          .from('dogs')
          .select('name')
          .eq('owner_id', user.id)
          .limit(1)
          .single();

        // Get user stats for the past week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Get profile views (this would need to be tracked in a separate table)
        const { count: profileViews } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true })
          .eq('viewed_user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString());

        // Get messages received
        const { count: messagesReceived } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString());

        // Get meetings scheduled
        const { count: meetingsScheduled } = await supabase
          .from('meetings')
          .select('*', { count: 'exact', head: true })
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .gte('created_at', oneWeekAgo.toISOString());

        // Get connections made (users they've messaged with)
        const { data: connections } = await supabase
          .from('messages')
          .select('sender_id, recipient_id')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .gte('created_at', oneWeekAgo.toISOString());

        const uniqueConnections = new Set();
        connections?.forEach(msg => {
          const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
          uniqueConnections.add(otherUserId);
        });

        // Send follow-up email
        await sendFollowUpEmail({
          to: user.email,
          userName: user.first_name || 'there',
          userDogName: userDog?.name || 'your dog',
          profileViews: profileViews || 0,
          messagesReceived: messagesReceived || 0,
          meetingsScheduled: meetingsScheduled || 0,
          connectionsMade: uniqueConnections.size,
        });

        emailsSent++;

        // Mark that follow-up was sent (optional - you might want to track this)
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            follow_up_email_sent: true,
            follow_up_email_sent_at: new Date().toISOString()
          });

      } catch (error) {
        console.error(`Error sending follow-up email to user ${user.id}:`, error);
        errors.push({
          userId: user.id,
          email: user.email,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Follow-up emails processed`,
      emailsSent,
      usersProcessed: users?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in follow-up emails cron job:', error);
    return Response.json(
      { error: 'Failed to process follow-up emails' }, 
      { status: 500 }
    );
  }
}

