import { sendReviewEmail } from '@/libs/emailTemplates';
import { createClient } from '@/libs/supabase/server';

export async function POST(request) {
  try {
    const { meetingId, userId } = await request.json();

    if (!meetingId || !userId) {
      return Response.json({ 
        error: 'Meeting ID and user ID are required' 
      }, { status: 400 });
    }

    const supabase = createClient();

    // Get meeting details with user and dog information
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select(`
        *,
        requester:profiles!meetings_requester_id_fkey(first_name, last_name, email),
        requester_dog:dogs!meetings_requester_dog_id_fkey(name),
        recipient:profiles!meetings_recipient_id_fkey(first_name, last_name, email),
        recipient_dog:dogs!meetings_recipient_dog_id_fkey(name)
      `)
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      return Response.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Only send review request for completed meetings
    if (meeting.status !== 'completed') {
      return Response.json({ 
        success: true, 
        message: 'Meeting not completed yet, skipping review request' 
      });
    }

    // Check if review request already sent for this meeting and user
    const { data: existingReview } = await supabase
      .from('meeting_review_requests')
      .select('id')
      .eq('meeting_id', meetingId)
      .eq('user_id', userId)
      .single();

    if (existingReview) {
      return Response.json({ 
        success: true, 
        message: 'Review request already sent for this meeting' 
      });
    }

    // Determine which user is receiving the email
    const isRequester = meeting.requester_id === userId;
    const user = isRequester ? meeting.requester : meeting.recipient;
    const otherUser = isRequester ? meeting.recipient : meeting.requester;
    const userDog = isRequester ? meeting.requester_dog : meeting.recipient_dog;
    const otherUserDog = isRequester ? meeting.recipient_dog : meeting.requester_dog;

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

    // Send review request email
    await sendReviewEmail({
      to: user.email,
      userName: user.first_name || 'there',
      userDogName: userDog?.name || 'your dog',
      otherUserName: `${otherUser.first_name} ${otherUser.last_name}`.trim(),
      otherUserDogName: otherUserDog?.name || 'their dog',
      meetingDate: new Date(meeting.start_datetime).toLocaleDateString(),
      meetingLocation: meeting.location,
      reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/reviews/${meetingId}`,
      messageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/messages`,
      userId: userId,
    });

    // Mark that review request was sent
    await supabase
      .from('meeting_review_requests')
      .insert({
        meeting_id: meetingId,
        user_id: userId,
        sent_at: new Date().toISOString()
      });

    return Response.json({ 
      success: true, 
      message: 'Review request sent successfully' 
    });

  } catch (error) {
    console.error('Error sending review request:', error);
    return Response.json(
      { error: 'Failed to send review request' }, 
      { status: 500 }
    );
  }
}
