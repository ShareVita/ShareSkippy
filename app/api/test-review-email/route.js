import { sendReviewEmail } from '@/libs/emailTemplates';

export async function GET() {
  try {
    const reviewEmail = 'kcolban@gmail.com';
    const appUrl = 'shareskippy.com';

    console.log('📧 Sending Review Email test...');

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

    return Response.json({
      success: true,
      message: 'Review email sent successfully!',
      email: reviewEmail
    });

  } catch (error) {
    console.error('❌ Review email failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Review email failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
