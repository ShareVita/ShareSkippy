import { sendNewMessageNotification } from '@/libs/emailTemplates';
import { createClient } from '@/libs/supabase/server';

export async function POST(request) {
  try {
    const { 
      recipientId, 
      senderId, 
      messagePreview, 
      messageId 
    } = await request.json();

    if (!recipientId || !senderId || !messagePreview) {
      return Response.json({ 
        error: 'Recipient ID, sender ID, and message preview are required' 
      }, { status: 400 });
    }

    const supabase = createClient();

    // Get recipient data
    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      return Response.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Get sender data
    const { data: sender, error: senderError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', senderId)
      .single();

    if (senderError || !sender) {
      return Response.json({ error: 'Sender not found' }, { status: 404 });
    }

    // Check if user has email notifications enabled
    const { data: settings } = await supabase
      .from('user_settings')
      .select('email_notifications')
      .eq('user_id', recipientId)
      .single();

    if (settings && !settings.email_notifications) {
      return Response.json({ 
        success: true, 
        message: 'Email notifications disabled for user' 
      });
    }

    // Send new message notification
    await sendNewMessageNotification({
      to: recipient.email,
      recipientName: recipient.first_name || 'there',
      senderName: `${sender.first_name} ${sender.last_name}`.trim(),
      senderInitial: (sender.first_name || 'U')[0].toUpperCase(),
      messagePreview: messagePreview.substring(0, 100) + (messagePreview.length > 100 ? '...' : ''),
      messageTime: new Date().toLocaleString(),
      messageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/messages/${messageId}`,
    });

    return Response.json({ 
      success: true, 
      message: 'New message notification sent successfully' 
    });

  } catch (error) {
    console.error('Error sending new message notification:', error);
    return Response.json(
      { error: 'Failed to send new message notification' }, 
      { status: 500 }
    );
  }
}

