import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  sendWelcomeEmail, 
  sendNewMessageNotification, 
  sendMeetingScheduledConfirmation,
  sendMeetingReminder,
  sendFollowUp3DaysEmail,
  sendFollowUpEmail,
  sendReviewEmail
} from '@/libs/emailTemplates';

// Mock the sendEmail function
vi.mock('@/libs/resend.js', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'test-email-id' })
}));

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn().mockReturnValue('<html>Test template with {{userName}}</html>')
}));

// Mock config
vi.mock('@/config', () => ({
  default: {
    domainName: 'shareskippy.com'
  }
}));

describe('Email Templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set debug logging for tests
    process.env.EMAIL_DEBUG_LOG = '1';
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct parameters', async () => {
      const mockSendEmail = await import('@/libs/resend.js');
      
      await sendWelcomeEmail({
        to: 'test@example.com',
        userName: 'John',
        userId: 'user-123'
      });

      expect(mockSendEmail.sendEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Welcome to ShareSkippy, John! 🐕',
        html: expect.any(String),
        text: expect.any(String)
      });
    });

    it('should log email operation when debug logging is enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      await sendWelcomeEmail({
        to: 'test@example.com',
        userName: 'John',
        userId: 'user-123'
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"email_key":"welcome"')
      );
    });
  });

  describe('sendNewMessageNotification', () => {
    it('should send new message notification with correct parameters', async () => {
      const mockSendEmail = await import('@/libs/resend.js');
      
      await sendNewMessageNotification({
        to: 'recipient@example.com',
        recipientName: 'Jane',
        senderName: 'John Doe',
        senderInitial: 'J',
        messagePreview: 'Hello there!',
        messageTime: '2024-01-01 12:00:00',
        messageUrl: 'https://shareskippy.com/messages/123',
        userId: 'user-456'
      });

      expect(mockSendEmail.sendEmail).toHaveBeenCalledWith({
        to: 'recipient@example.com',
        subject: 'New message from John Doe on ShareSkippy 💬',
        html: expect.any(String),
        text: expect.any(String)
      });
    });
  });

  describe('sendMeetingScheduledConfirmation', () => {
    it('should send meeting confirmation with correct parameters', async () => {
      const mockSendEmail = await import('@/libs/resend.js');
      
      await sendMeetingScheduledConfirmation({
        to: 'user@example.com',
        userName: 'John',
        userDogName: 'Buddy',
        otherUserName: 'Jane Smith',
        otherUserDogName: 'Max',
        meetingDate: '2024-01-15',
        meetingTime: '2:00 PM',
        meetingLocation: 'Central Park',
        meetingNotes: 'Bring treats!',
        meetingUrl: 'https://shareskippy.com/meetings/123',
        messageUrl: 'https://shareskippy.com/messages',
        userId: 'user-123'
      });

      expect(mockSendEmail.sendEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Meeting Confirmed! Playdate with Jane Smith 🎉',
        html: expect.any(String),
        text: expect.any(String)
      });
    });
  });

  describe('sendMeetingReminder', () => {
    it('should send meeting reminder with correct parameters', async () => {
      const mockSendEmail = await import('@/libs/resend.js');
      
      await sendMeetingReminder({
        to: 'user@example.com',
        userName: 'John',
        userDogName: 'Buddy',
        otherUserName: 'Jane Smith',
        otherUserDogName: 'Max',
        meetingDate: '2024-01-15',
        meetingTime: '2:00 PM',
        meetingLocation: 'Central Park',
        meetingUrl: 'https://shareskippy.com/meetings/123',
        messageUrl: 'https://shareskippy.com/messages',
        unsubscribeUrl: 'https://shareskippy.com/profile',
        userId: 'user-123'
      });

      expect(mockSendEmail.sendEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Reminder: Playdate with Jane Smith tomorrow! ⏰',
        html: expect.any(String),
        text: expect.any(String)
      });
    });
  });

  describe('sendFollowUp3DaysEmail', () => {
    it('should send 3-day follow-up with correct parameters', async () => {
      const mockSendEmail = await import('@/libs/resend.js');
      
      await sendFollowUp3DaysEmail({
        to: 'user@example.com',
        userName: 'John',
        userId: 'user-123'
      });

      expect(mockSendEmail.sendEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Ready to connect with your neighbors? 🐕',
        html: expect.any(String),
        text: expect.any(String)
      });
    });
  });

  describe('sendFollowUpEmail', () => {
    it('should send 1-week follow-up with correct parameters', async () => {
      const mockSendEmail = await import('@/libs/resend.js');
      
      await sendFollowUpEmail({
        to: 'user@example.com',
        userName: 'John',
        userDogName: 'Buddy',
        profileViews: 5,
        messagesReceived: 3,
        meetingsScheduled: 1,
        connectionsMade: 2,
        userId: 'user-123'
      });

      expect(mockSendEmail.sendEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'How\'s ShareSkippy going? - 1 Week Check-in 📅',
        html: expect.any(String),
        text: expect.any(String),
        replyTo: 'support@shareskippy.com'
      });
    });
  });

  describe('sendReviewEmail', () => {
    it('should send review request with correct parameters', async () => {
      const mockSendEmail = await import('@/libs/resend.js');
      
      await sendReviewEmail({
        to: 'user@example.com',
        userName: 'John',
        userDogName: 'Buddy',
        otherUserName: 'Jane Smith',
        otherUserDogName: 'Max',
        meetingDate: '2024-01-15',
        meetingLocation: 'Central Park',
        reviewUrl: 'https://shareskippy.com/reviews/123',
        messageUrl: 'https://shareskippy.com/messages',
        userId: 'user-123'
      });

      expect(mockSendEmail.sendEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'How was your playdate with Jane Smith? 🐕',
        html: expect.any(String),
        text: expect.any(String)
      });
    });
  });
});
