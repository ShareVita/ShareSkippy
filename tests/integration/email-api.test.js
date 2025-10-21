import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    }),
  },
};

vi.mock('@/libs/supabase/server', () => ({
  createClient: vi.fn().mockReturnValue(mockSupabase),
  createServiceClient: vi.fn().mockReturnValue(mockSupabase),
}));

// Mock email templates
vi.mock('@/libs/emailTemplates', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue({ id: 'welcome-email-id' }),
  sendNewMessageNotification: vi.fn().mockResolvedValue({ id: 'message-email-id' }),
  sendMeetingScheduledConfirmation: vi.fn().mockResolvedValue({ id: 'meeting-email-id' }),
  sendMeetingReminder: vi.fn().mockResolvedValue({ id: 'reminder-email-id' }),
  sendFollowUp3DaysEmail: vi.fn().mockResolvedValue({ id: 'followup-3day-email-id' }),
  sendFollowUpEmail: vi.fn().mockResolvedValue({ id: 'followup-email-id' }),
  sendReviewEmail: vi.fn().mockResolvedValue({ id: 'review-email-id' }),
}));

describe('Email API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EMAIL_DEBUG_LOG = '1';
  });

  describe('POST /api/emails/welcome', () => {
    it('should send welcome email for valid user', async () => {
      const { default: handler } = await import('@/app/api/emails/welcome/route');

      mockSupabase.single.mockResolvedValue({
        data: { email: 'test@example.com', first_name: 'John' },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/emails/welcome', {
        method: 'POST',
        body: JSON.stringify({ userId: 'test-user-id' }),
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Welcome email sent successfully');
    });

    it('should return 404 for non-existent user', async () => {
      const { default: handler } = await import('@/app/api/emails/welcome/route');

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const request = new NextRequest('http://localhost:3000/api/emails/welcome', {
        method: 'POST',
        body: JSON.stringify({ userId: 'non-existent-user' }),
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe('User not found');
    });
  });

  describe('POST /api/emails/send-new-message', () => {
    it('should send new message notification', async () => {
      const { default: handler } = await import('@/app/api/emails/send-new-message/route');

      mockSupabase.single
        .mockResolvedValueOnce({
          data: { email: 'recipient@example.com', first_name: 'Jane' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { first_name: 'John', last_name: 'Doe' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { email_notifications: true },
          error: null,
        });

      const request = new NextRequest('http://localhost:3000/api/emails/send-new-message', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: 'recipient-id',
          senderId: 'sender-id',
          messagePreview: 'Hello there!',
          messageId: 'message-123',
        }),
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it('should skip email if notifications disabled', async () => {
      const { default: handler } = await import('@/app/api/emails/send-new-message/route');

      mockSupabase.single
        .mockResolvedValueOnce({
          data: { email: 'recipient@example.com', first_name: 'Jane' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { first_name: 'John', last_name: 'Doe' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { email_notifications: false },
          error: null,
        });

      const request = new NextRequest('http://localhost:3000/api/emails/send-new-message', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: 'recipient-id',
          senderId: 'sender-id',
          messagePreview: 'Hello there!',
          messageId: 'message-123',
        }),
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.message).toBe('Email notifications disabled for user');
    });
  });

  describe('POST /api/emails/meeting-scheduled', () => {
    it('should send meeting confirmation for confirmed meetings', async () => {
      const { default: handler } = await import('@/app/api/emails/meeting-scheduled/route');

      mockSupabase.single
        .mockResolvedValueOnce({
          data: {
            id: 'meeting-123',
            status: 'confirmed',
            requester_id: 'requester-id',
            recipient_id: 'recipient-id',
            scheduled_date: '2024-01-15T14:00:00Z',
            location: 'Central Park',
            notes: 'Bring treats!',
            requester: { first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
            recipient: { first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
            requester_dog: { name: 'Buddy' },
            recipient_dog: { name: 'Max' },
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { email_notifications: true },
          error: null,
        });

      const request = new NextRequest('http://localhost:3000/api/emails/meeting-scheduled', {
        method: 'POST',
        body: JSON.stringify({
          meetingId: 'meeting-123',
          userId: 'requester-id',
        }),
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it('should skip email for non-confirmed meetings', async () => {
      const { default: handler } = await import('@/app/api/emails/meeting-scheduled/route');

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'meeting-123',
          status: 'pending',
          requester_id: 'requester-id',
          recipient_id: 'recipient-id',
        },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/emails/meeting-scheduled', {
        method: 'POST',
        body: JSON.stringify({
          meetingId: 'meeting-123',
          userId: 'requester-id',
        }),
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.message).toBe('Meeting not confirmed yet, skipping email');
    });
  });

  describe('GET /api/cron/send-email-reminders', () => {
    it("should send meeting reminders for tomorrow's meetings", async () => {
      const { GET } = await import('@/app/api/cron/send-email-reminders/route');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      mockSupabase.select.mockResolvedValue({
        data: [
          {
            id: 'meeting-123',
            status: 'confirmed',
            scheduled_date: tomorrow.toISOString(),
            location: 'Central Park',
            requester_id: 'requester-id',
            recipient_id: 'recipient-id',
            requester: { first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
            recipient: { first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
            requester_dog: { name: 'Buddy' },
            recipient_dog: { name: 'Max' },
          },
        ],
        error: null,
      });

      mockSupabase.update.mockResolvedValue({ error: null });

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(2);
    });
  });

  describe('GET /api/cron/send-follow-up-emails', () => {
    it('should send 1-week follow-up emails', async () => {
      const { GET } = await import('@/app/api/cron/send-follow-up-emails/route');

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      mockSupabase.select
        .mockResolvedValueOnce({
          data: [
            {
              id: 'user-123',
              email: 'user@example.com',
              first_name: 'John',
              created_at: sevenDaysAgo.toISOString(),
            },
          ],
          error: null,
        })
        .mockResolvedValueOnce({
          data: { email_notifications: true },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { name: 'Buddy' },
          error: null,
        })
        .mockResolvedValueOnce({
          count: 5,
          error: null,
        })
        .mockResolvedValueOnce({
          count: 3,
          error: null,
        })
        .mockResolvedValueOnce({
          count: 1,
          error: null,
        })
        .mockResolvedValueOnce({
          data: [{ sender_id: 'user-456', recipient_id: 'user-123' }],
          error: null,
        });

      mockSupabase.upsert.mockResolvedValue({ error: null });

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(1);
    });
  });

  describe('GET /api/cron/send-3day-follow-up-emails', () => {
    it('should send 3-day follow-up emails', async () => {
      const { GET } = await import('@/app/api/cron/send-3day-follow-up-emails/route');

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);

      mockSupabase.select
        .mockResolvedValueOnce({
          data: [
            {
              id: 'user-123',
              email: 'user@example.com',
              first_name: 'John',
              created_at: threeDaysAgo.toISOString(),
            },
          ],
          error: null,
        })
        .mockResolvedValueOnce({
          data: { email_notifications: true, follow_up_3day_sent: false },
          error: null,
        });

      mockSupabase.upsert.mockResolvedValue({ error: null });

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(1);
    });
  });
});
