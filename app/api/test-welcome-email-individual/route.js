import { sendWelcomeEmail } from '@/libs/emailTemplates';

export async function GET() {
  try {
    const reviewEmail = 'kcolban@gmail.com';
    const appUrl = 'shareskippy.com';

    console.log('📧 Sending Welcome Email...');

    await sendWelcomeEmail({
      to: reviewEmail,
      userName: 'Review User',
      appUrl: appUrl
    });

    return Response.json({
      success: true,
      message: 'Welcome email sent successfully!',
      email: reviewEmail
    });

  } catch (error) {
    console.error('❌ Welcome email failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Welcome email failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
