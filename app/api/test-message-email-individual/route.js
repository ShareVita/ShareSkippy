import { sendNewMessageNotification } from '@/libs/emailTemplates';

export async function GET() {
  try {
    const reviewEmail = 'kcolban@gmail.com';
    const appUrl = 'shareskippy.com';

    console.log('📧 Sending New Message Notification...');

    await sendNewMessageNotification({
      to: reviewEmail,
      recipientName: 'Review User',
      senderName: 'John Doe',
      senderInitial: 'J',
      messagePreview: 'Hey! Would you like to schedule a playdate with our dogs? This is a test message for email review.',
      messageTime: new Date().toLocaleString(),
      messageUrl: `https://${appUrl}/messages/123`,
    });

    return Response.json({
      success: true,
      message: 'New message notification sent successfully!',
      email: reviewEmail
    });

  } catch (error) {
    console.error('❌ New message notification failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'New message notification failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
