import { sendFollowUpEmail } from '@/libs/emailTemplates';

export async function GET() {
  try {
    const reviewEmail = 'kcolban@gmail.com';
    const appUrl = 'shareskippy.com';

    console.log('📧 Sending Follow-up Email...');

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

    return Response.json({
      success: true,
      message: 'Follow-up email sent successfully!',
      email: reviewEmail
    });

  } catch (error) {
    console.error('❌ Follow-up email failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Follow-up email failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
