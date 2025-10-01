/**
 * Example usage of ShareSkippy email system
 * 
 * This file demonstrates how to integrate the email system
 * into your ShareSkippy application.
 */

import { 
  sendWelcomeEmail,
  sendNewMessageNotification,
  sendMeetingScheduledConfirmation,
  sendMeetingReminder,
  sendFollowUpEmail
} from '@/libs/emailTemplates';

// Example 1: Send welcome email after user signup
export async function handleUserSignup(userData) {
  try {
    // Create user in database first
    const newUser = await createUser(userData);
    
    // Send welcome email
    await sendWelcomeEmail({
      to: newUser.email,
      userName: newUser.first_name,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'shareskippy.com'
    });
    
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

// Example 2: Send new message notification
export async function handleNewMessage(messageData) {
  try {
    // Create message in database first
    const newMessage = await createMessage(messageData);
    
    // Get sender and recipient data
    const sender = await getUserById(messageData.sender_id);
    const recipient = await getUserById(messageData.recipient_id);
    
    // Send notification email
    await sendNewMessageNotification({
      to: recipient.email,
      recipientName: recipient.first_name,
      senderName: `${sender.first_name} ${sender.last_name}`.trim(),
      senderInitial: sender.first_name[0].toUpperCase(),
      messagePreview: messageData.content.substring(0, 100),
      messageTime: new Date().toLocaleString(),
      messageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/messages/${newMessage.id}`,
    });
    
    console.log('New message notification sent');
  } catch (error) {
    console.error('Error sending message notification:', error);
  }
}

// Example 3: Send meeting confirmation
export async function handleMeetingScheduled(meetingData) {
  try {
    // Create meeting in database first
    const newMeeting = await createMeeting(meetingData);
    
    // Get all participants and their dogs
    const requester = await getUserById(meetingData.requester_id);
    const recipient = await getUserById(meetingData.recipient_id);
    const requesterDog = await getDogById(meetingData.requester_dog_id);
    const recipientDog = await getDogById(meetingData.recipient_dog_id);
    
    // Send confirmation to requester
    await sendMeetingScheduledConfirmation({
      to: requester.email,
      userName: requester.first_name,
      userDogName: requesterDog.name,
      otherUserName: `${recipient.first_name} ${recipient.last_name}`.trim(),
      otherUserDogName: recipientDog.name,
      meetingDate: new Date(meetingData.start_datetime).toLocaleDateString(),
      meetingTime: new Date(meetingData.start_datetime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      meetingLocation: meetingData.location,
      meetingNotes: meetingData.notes || '',
      meetingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/meetings/${newMeeting.id}`,
      messageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/messages`,
    });
    
    // Send confirmation to recipient
    await sendMeetingScheduledConfirmation({
      to: recipient.email,
      userName: recipient.first_name,
      userDogName: recipientDog.name,
      otherUserName: `${requester.first_name} ${requester.last_name}`.trim(),
      otherUserDogName: requesterDog.name,
      meetingDate: new Date(meetingData.start_datetime).toLocaleDateString(),
      meetingTime: new Date(meetingData.start_datetime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      meetingLocation: meetingData.location,
      meetingNotes: meetingData.notes || '',
      meetingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/meetings/${newMeeting.id}`,
      messageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/messages`,
    });
    
    console.log('Meeting confirmation emails sent');
  } catch (error) {
    console.error('Error sending meeting confirmation:', error);
  }
}

// Example 4: Send meeting reminder (used in cron job)
export async function sendDailyMeetingReminders() {
  try {
    // Get meetings scheduled for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const meetings = await getMeetingsForDateRange(tomorrow, dayAfter);
    
    for (const meeting of meetings) {
      // Send reminder to both participants
      await sendMeetingReminder({
        to: meeting.requester.email,
        userName: meeting.requester.first_name,
        userDogName: meeting.requester_dog.name,
        otherUserName: `${meeting.recipient.first_name} ${meeting.recipient.last_name}`.trim(),
        otherUserDogName: meeting.recipient_dog.name,
        meetingDate: new Date(meeting.start_datetime).toLocaleDateString(),
        meetingTime: new Date(meeting.start_datetime).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        meetingLocation: meeting.location,
        meetingNotes: meeting.notes || '',
        meetingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/meetings/${meeting.id}`,
        messageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/messages`,
      });
      
      // Send to recipient as well...
      // (similar code for recipient)
    }
    
    console.log(`Sent ${meetings.length * 2} meeting reminders`);
  } catch (error) {
    console.error('Error sending meeting reminders:', error);
  }
}

// Example 5: Send follow-up email (used in cron job)
export async function sendWeeklyFollowUpEmails() {
  try {
    // Get users who signed up 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const sixDaysAgo = new Date(sevenDaysAgo);
    sixDaysAgo.setDate(sixDaysAgo.getDate() + 1);

    const users = await getUsersBySignupDate(sevenDaysAgo, sixDaysAgo);
    
    for (const user of users) {
      // Get user stats
      const stats = await getUserStats(user.id, sevenDaysAgo);
      
      // Get user's first dog
      const userDog = await getUserFirstDog(user.id);
      
      await sendFollowUpEmail({
        to: user.email,
        userName: user.first_name,
        userDogName: userDog?.name || 'your dog',
        profileViews: stats.profileViews,
        messagesReceived: stats.messagesReceived,
        meetingsScheduled: stats.meetingsScheduled,
        connectionsMade: stats.connectionsMade,
      });
    }
    
    console.log(`Sent ${users.length} follow-up emails`);
  } catch (error) {
    console.error('Error sending follow-up emails:', error);
  }
}

// Example 6: Using the API endpoints instead of direct functions
export async function sendWelcomeEmailViaAPI(userId) {
  try {
    const response = await fetch('/api/emails/welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error);
    }
    
    console.log('Welcome email sent via API');
    return result;
  } catch (error) {
    console.error('Error sending welcome email via API:', error);
  }
}

// Example 7: Batch email sending with error handling
export async function sendBatchEmails(emails) {
  const results = {
    successful: [],
    failed: []
  };
  
  for (const email of emails) {
    try {
      await sendWelcomeEmail(email);
      results.successful.push(email.to);
    } catch (error) {
      console.error(`Failed to send email to ${email.to}:`, error);
      results.failed.push({
        email: email.to,
        error: error.message
      });
    }
  }
  
  console.log(`Batch email results: ${results.successful.length} successful, ${results.failed.length} failed`);
  return results;
}

// Example 8: Email template testing
export async function testEmailTemplates() {
  const testData = {
    to: 'test@example.com',
    userName: 'Test User',
    userDogName: 'Test Dog',
    otherUserName: 'Other User',
    otherUserDogName: 'Other Dog',
    meetingDate: 'March 15, 2024',
    meetingTime: '2:00 PM',
    meetingLocation: 'Test Park',
    meetingNotes: 'Test notes',
    meetingUrl: 'https://shareskippy.com/meetings/123',
    messageUrl: 'https://shareskippy.com/messages',
    appUrl: 'shareskippy.com'
  };
  
  try {
    // Test welcome email
    await sendWelcomeEmail({
      to: testData.to,
      userName: testData.userName,
      appUrl: testData.appUrl
    });
    
    // Test meeting confirmation
    await sendMeetingScheduledConfirmation({
      to: testData.to,
      userName: testData.userName,
      userDogName: testData.userDogName,
      otherUserName: testData.otherUserName,
      otherUserDogName: testData.otherUserDogName,
      meetingDate: testData.meetingDate,
      meetingTime: testData.meetingTime,
      meetingLocation: testData.meetingLocation,
      meetingNotes: testData.meetingNotes,
      meetingUrl: testData.meetingUrl,
      messageUrl: testData.messageUrl,
    });
    
    console.log('All email templates tested successfully');
  } catch (error) {
    console.error('Error testing email templates:', error);
  }
}

// Helper functions (these would be your actual database functions)
async function createUser(userData) {
  // Your user creation logic
  return { id: 'user-123', email: userData.email, first_name: userData.firstName };
}

async function createMessage(messageData) {
  // Your message creation logic
  return { id: 'msg-123', ...messageData };
}

async function createMeeting(meetingData) {
  // Your meeting creation logic
  return { id: 'meeting-123', ...meetingData };
}

async function getUserById(userId) {
  // Your user retrieval logic
  return { id: userId, email: 'user@example.com', first_name: 'John', last_name: 'Doe' };
}

async function getDogById(dogId) {
  // Your dog retrieval logic
  return { id: dogId, name: 'Buddy' };
}

async function getMeetingsForDateRange(startDate, endDate) {
  // Your meeting retrieval logic
  return [];
}

async function getUsersBySignupDate(startDate, endDate) {
  // Your user retrieval logic
  return [];
}

async function getUserStats(userId, sinceDate) {
  // Your stats retrieval logic
  return {
    profileViews: 5,
    messagesReceived: 3,
    meetingsScheduled: 1,
    connectionsMade: 2
  };
}

async function getUserFirstDog(userId) {
  // Your dog retrieval logic
  return { name: 'Buddy' };
}

