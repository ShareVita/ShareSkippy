import { 
  sendWelcomeEmail,
  sendNewMessageNotification,
  sendMeetingScheduledConfirmation,
  sendMeetingReminder,
  sendFollowUpEmail,
  sendReviewEmail
} from '@/libs/emailTemplates';

export async function GET() {
  try {
    const reviewEmail = 'kcolban@gmail.com';
    const appUrl = 'shareskippy.com';

    console.log('📧 Sending all email types to kcolban@gmail.com for review...');

    const results = [];

    // 1. Welcome Email
    console.log('1️⃣ Sending Welcome Email...');
    try {
      await sendWelcomeEmail({
        to: reviewEmail,
        userName: 'Review User',
        appUrl: appUrl
      });
      results.push({ type: 'Welcome Email', status: 'success' });
      console.log('✅ Welcome email sent successfully!');
    } catch (error) {
      results.push({ type: 'Welcome Email', status: 'error', error: error.message });
      console.error('❌ Welcome email failed:', error);
    }

    // 2. New Message Notification
    console.log('2️⃣ Sending New Message Notification...');
    try {
      await sendNewMessageNotification({
        to: reviewEmail,
        recipientName: 'Review User',
        senderName: 'John Doe',
        senderInitial: 'J',
        messagePreview: 'Hey! Would you like to schedule a playdate with our dogs? This is a test message for email review.',
        messageTime: new Date().toLocaleString(),
        messageUrl: `https://${appUrl}/messages/123`,
      });
      results.push({ type: 'New Message Notification', status: 'success' });
      console.log('✅ New message notification sent successfully!');
    } catch (error) {
      results.push({ type: 'New Message Notification', status: 'error', error: error.message });
      console.error('❌ New message notification failed:', error);
    }

    // 3. Meeting Scheduled Confirmation
    console.log('3️⃣ Sending Meeting Scheduled Confirmation...');
    try {
      await sendMeetingScheduledConfirmation({
        to: reviewEmail,
        userName: 'Review User',
        userDogName: 'Buddy',
        otherUserName: 'Jane Smith',
        otherUserDogName: 'Luna',
        meetingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
        meetingTime: '2:00 PM',
        meetingLocation: 'Central Park',
        meetingNotes: 'Bring water and treats for both dogs! This is a test meeting for email review.',
        meetingUrl: `https://${appUrl}/meetings/456`,
        messageUrl: `https://${appUrl}/messages`,
      });
      results.push({ type: 'Meeting Scheduled Confirmation', status: 'success' });
      console.log('✅ Meeting scheduled confirmation sent successfully!');
    } catch (error) {
      results.push({ type: 'Meeting Scheduled Confirmation', status: 'error', error: error.message });
      console.error('❌ Meeting scheduled confirmation failed:', error);
    }

    // 4. Meeting Reminder
    console.log('4️⃣ Sending Meeting Reminder...');
    try {
      await sendMeetingReminder({
        to: reviewEmail,
        userName: 'Review User',
        userDogName: 'Buddy',
        otherUserName: 'Jane Smith',
        otherUserDogName: 'Luna',
        meetingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
        meetingTime: '2:00 PM',
        meetingLocation: 'Central Park',
        meetingNotes: 'Bring water and treats for both dogs! This is a test reminder for email review.',
        meetingUrl: `https://${appUrl}/meetings/456`,
        messageUrl: `https://${appUrl}/messages`,
      });
      results.push({ type: 'Meeting Reminder', status: 'success' });
      console.log('✅ Meeting reminder sent successfully!');
    } catch (error) {
      results.push({ type: 'Meeting Reminder', status: 'error', error: error.message });
      console.error('❌ Meeting reminder failed:', error);
    }

    // 5. Follow-up Email
    console.log('5️⃣ Sending Follow-up Email...');
    try {
      await sendFollowUpEmail({
        to: reviewEmail,
        userName: 'Review User',
        userDogName: 'Buddy',
        profileViews: 12,
        messagesReceived: 5,
        meetingsScheduled: 2,
        connectionsMade: 3,
        appUrl: appUrl
      });
      results.push({ type: 'Follow-up Email', status: 'success' });
      console.log('✅ Follow-up email sent successfully!');
    } catch (error) {
      results.push({ type: 'Follow-up Email', status: 'error', error: error.message });
      console.error('❌ Follow-up email failed:', error);
    }

    // 6. Review Request Email
    console.log('6️⃣ Sending Review Request Email...');
    try {
      await sendReviewEmail({
        to: reviewEmail,
        userName: 'Review User',
        userDogName: 'Buddy',
        otherUserName: 'Jane Smith',
        otherUserDogName: 'Luna',
        meetingDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
        meetingLocation: 'Central Park',
        reviewUrl: `https://${appUrl}/reviews/new?meeting=456`,
        messageUrl: `https://${appUrl}/messages`,
        appUrl: appUrl
      });
      results.push({ type: 'Review Request Email', status: 'success' });
      console.log('✅ Review request email sent successfully!');
    } catch (error) {
      results.push({ type: 'Review Request Email', status: 'error', error: error.message });
      console.error('❌ Review request email failed:', error);
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return Response.json({
      success: true,
      message: `All email types sent to kcolban@gmail.com for review! ${successCount} successful, ${errorCount} failed.`,
      reviewEmail: reviewEmail,
      results: results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: errorCount
      }
    });

  } catch (error) {
    console.error('❌ Email review batch failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Email review batch failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
