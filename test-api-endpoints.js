/**
 * Test script for ShareSkippy email API endpoints
 * Run this to test the API endpoints
 */

const BASE_URL = 'http://localhost:3000'; // Change to your app URL
const testEmail = 'your-test-email@example.com'; // Replace with your email

async function testAPIEndpoint(endpoint, data) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${endpoint} - Success:`, result.message);
    } else {
      console.log(`❌ ${endpoint} - Error:`, result.error);
    }
  } catch (error) {
    console.log(`❌ ${endpoint} - Network Error:`, error.message);
  }
}

async function testAllAPIEndpoints() {
  console.log('🧪 Testing ShareSkippy Email API Endpoints...\n');

  // Test 1: Welcome Email
  console.log('1️⃣ Testing Welcome Email API...');
  await testAPIEndpoint('/api/emails/welcome', {
    userId: 'test-user-id' // You'll need a real user ID from your database
  });

  // Test 2: New Message Notification
  console.log('\n2️⃣ Testing New Message Notification API...');
  await testAPIEndpoint('/api/emails/new-message', {
    recipientId: 'test-recipient-id',
    senderId: 'test-sender-id',
    messagePreview: 'Hey! Would you like to schedule a playdate?',
    messageId: 'test-message-id'
  });

  // Test 3: Meeting Scheduled Confirmation
  console.log('\n3️⃣ Testing Meeting Scheduled Confirmation API...');
  await testAPIEndpoint('/api/emails/meeting-scheduled', {
    meetingId: 'test-meeting-id',
    userId: 'test-user-id'
  });

  // Test 4: Meeting Reminder
  console.log('\n4️⃣ Testing Meeting Reminder API...');
  await testAPIEndpoint('/api/emails/meeting-reminder', {
    meetingId: 'test-meeting-id',
    userId: 'test-user-id'
  });

  // Test 5: Follow-up Email
  console.log('\n5️⃣ Testing Follow-up Email API...');
  await testAPIEndpoint('/api/emails/follow-up', {
    userId: 'test-user-id'
  });

  console.log('\n🎉 API endpoint tests completed!');
}

// Run the tests
testAPIEndpoints();

