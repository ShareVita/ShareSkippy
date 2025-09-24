import { sendMeetingScheduledConfirmation } from '@/libs/emailTemplates';

export async function GET() {
  try {
    const reviewEmail = 'kcolban@gmail.com';
    const appUrl = 'shareskippy.com';

    console.log('📧 Sending Meeting Scheduled Confirmation...');

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

    return Response.json({
      success: true,
      message: 'Meeting scheduled confirmation sent successfully!',
      email: reviewEmail
    });

  } catch (error) {
    console.error('❌ Meeting scheduled confirmation failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Meeting scheduled confirmation failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
