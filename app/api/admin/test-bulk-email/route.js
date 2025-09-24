import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase/server';
import { sendEmail } from '@/libs/resend';

export async function POST(request) {
  try {
    const { testEmail, subject, htmlContent, textContent } = await request.json();

    if (!testEmail || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'testEmail, subject, and htmlContent are required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServiceClient();

    // Get a single user for testing personalization
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('email', testEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Test user not found' },
        { status: 404 }
      );
    }

    // Personalize email content
    const personalizedHtml = htmlContent
      .replace(/{{first_name}}/g, user.first_name || '')
      .replace(/{{last_name}}/g, user.last_name || '')
      .replace(/{{email}}/g, user.email || '');

    const personalizedText = textContent
      ? textContent
          .replace(/{{first_name}}/g, user.first_name || '')
          .replace(/{{last_name}}/g, user.last_name || '')
          .replace(/{{email}}/g, user.email || '')
      : undefined;

    // Send test email
    await sendEmail({
      to: testEmail,
      subject,
      html: personalizedHtml,
      text: personalizedText
    });

    return NextResponse.json({
      message: 'Test email sent successfully',
      user: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
