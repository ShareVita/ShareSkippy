import { sendFollowUpEmail } from '@/libs/emailTemplates';
import { createClient } from '@/libs/supabase/server';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has email notifications enabled
    const { data: settings } = await supabase
      .from('user_settings')
      .select('email_notifications')
      .eq('user_id', userId)
      .single();

    if (settings && !settings.email_notifications) {
      return Response.json({ 
        success: true, 
        message: 'Email notifications disabled for user' 
      });
    }

    // Get user's first dog name
    const { data: userDog } = await supabase
      .from('dogs')
      .select('name')
      .eq('owner_id', userId)
      .limit(1)
      .single();

    // Get user stats for the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get profile views (this would need to be tracked in a separate table)
    const { count: profileViews } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('viewed_user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString());

    // Get messages received
    const { count: messagesReceived } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .gte('created_at', oneWeekAgo.toISOString());

    // Get meetings scheduled
    const { count: meetingsScheduled } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .gte('created_at', oneWeekAgo.toISOString());

    // Get connections made (users they've messaged with)
    const { data: connections } = await supabase
      .from('messages')
      .select('sender_id, recipient_id')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .gte('created_at', oneWeekAgo.toISOString());

    const uniqueConnections = new Set();
    connections?.forEach(msg => {
      const otherUserId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
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

    return Response.json({ 
      success: true, 
      message: 'Follow-up email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending follow-up email:', error);
    return Response.json(
      { error: 'Failed to send follow-up email' }, 
      { status: 500 }
    );
  }
}

