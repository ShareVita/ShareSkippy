import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/server';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const results = [];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 1. Send welcome email
    console.log('1️⃣ Sending Welcome Email...');
    try {
      const welcomeResponse = await fetch(`${baseUrl}/api/emails/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id })
      });
      const welcomeResult = await welcomeResponse.json();
      results.push({ type: 'Welcome Email', status: welcomeResponse.ok ? 'success' : 'error', result: welcomeResult });
    } catch (error) {
      results.push({ type: 'Welcome Email', status: 'error', error: error.message });
    }

    // 2. Send new message notification
    console.log('2️⃣ Sending New Message Notification...');
    try {
      const messageResponse = await fetch(`${baseUrl}/api/emails/new-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: profile.id,
          senderId: profile.id, // Using same user for test
          messagePreview: 'Hey! Would you like to schedule a playdate with our dogs? This is a test message for email review.',
          messageId: 'test-message-123'
        })
      });
      const messageResult = await messageResponse.json();
      results.push({ type: 'New Message Notification', status: messageResponse.ok ? 'success' : 'error', result: messageResult });
    } catch (error) {
      results.push({ type: 'New Message Notification', status: 'error', error: error.message });
    }

    // 3. Send meeting scheduled confirmation
    console.log('3️⃣ Sending Meeting Scheduled Confirmation...');
    try {
      // First create a test meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          requester_id: profile.id,
          recipient_id: profile.id,
          title: 'Test Meeting for Email Review',
          description: 'This is a test meeting for email review purposes',
          scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed'
        })
        .select()
        .single();

      if (!meetingError && meeting) {
        const meetingResponse = await fetch(`${baseUrl}/api/emails/meeting-scheduled`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: meeting.id, userId: profile.id })
        });
        const meetingResult = await meetingResponse.json();
        results.push({ type: 'Meeting Scheduled Confirmation', status: meetingResponse.ok ? 'success' : 'error', result: meetingResult });
      } else {
        results.push({ type: 'Meeting Scheduled Confirmation', status: 'error', error: 'Failed to create test meeting' });
      }
    } catch (error) {
      results.push({ type: 'Meeting Scheduled Confirmation', status: 'error', error: error.message });
    }

    // 4. Send meeting reminder
    console.log('4️⃣ Sending Meeting Reminder...');
    try {
      const reminderResponse = await fetch(`${baseUrl}/api/emails/meeting-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: 'test-meeting-123',
          userId: profile.id
        })
      });
      const reminderResult = await reminderResponse.json();
      results.push({ type: 'Meeting Reminder', status: reminderResponse.ok ? 'success' : 'error', result: reminderResult });
    } catch (error) {
      results.push({ type: 'Meeting Reminder', status: 'error', error: error.message });
    }

    // 5. Send follow-up email
    console.log('5️⃣ Sending Follow-up Email...');
    try {
      const followUpResponse = await fetch(`${baseUrl}/api/emails/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id })
      });
      const followUpResult = await followUpResponse.json();
      results.push({ type: 'Follow-up Email', status: followUpResponse.ok ? 'success' : 'error', result: followUpResult });
    } catch (error) {
      results.push({ type: 'Follow-up Email', status: 'error', error: error.message });
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      message: `All email types sent to ${email} for review! ${successCount} successful, ${errorCount} failed.`,
      reviewEmail: email,
      results: results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: errorCount
      }
    });

  } catch (error) {
    console.error('Error in test email batch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
