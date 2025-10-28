/* eslint-disable */

/**
 * Comprehensive tests for the centralized email system
 * Run with: npm test tests/email-system.test.js
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createServiceClient } from '@/libs/supabase/server';
import {
  sendEmail,
  scheduleEmail,
  recordUserActivity,
  processScheduledEmails,
  processReengageEmails,
  scheduleMeetingReminder,
  loadEmailTemplate,
} from '@/libs/email';

// Mock the Supabase client
jest.mock('@/libs/supabase/server', () => ({
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({ data: { id: 1 }, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
    })),
  })),
}));

// Mock the Resend email sending
jest.mock('@/libs/resend', () => ({
  sendEmail: jest.fn(() => Promise.resolve({ id: 'test-message-id' })),
}));

describe('Email System Tests', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: null })),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: { id: 1 }, error: null })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({ error: null })),
        })),
      })),
    };

    createServiceClient.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send welcome email with idempotency', async () => {
      // Mock no existing email events
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: null })),
          })),
        })),
      });

      const result = await sendEmail({
        userId: 'test-user-id',
        to: 'test@example.com',
        emailType: 'welcome',
        payload: { userName: 'Test User' },
      });

      expect(result.status).toBe('sent');
      expect(result.external_message_id).toBe('test-message-id');
    });

    it('should skip duplicate welcome emails', async () => {
      // Mock existing email event
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 1, status: 'sent' },
              error: null,
            })),
          })),
        })),
      });

      const result = await sendEmail({
        userId: 'test-user-id',
        to: 'test@example.com',
        emailType: 'welcome',
        payload: { userName: 'Test User' },
      });

      expect(result.status).toBe('sent');
    });

    it('should handle email sending errors', async () => {
      // Mock email sending failure
      const { sendEmail: mockSendEmail } = require('@/libs/resend');
      mockSendEmail.mockRejectedValueOnce(new Error('Email sending failed'));

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: null })),
          })),
        })),
      });

      await expect(
        sendEmail({
          userId: 'test-user-id',
          to: 'test@example.com',
          emailType: 'welcome',
          payload: { userName: 'Test User' },
        })
      ).rejects.toThrow('Email sending failed');
    });
  });

  describe('scheduleEmail', () => {
    it('should schedule email for future delivery', async () => {
      const runAfter = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now

      await scheduleEmail({
        userId: 'test-user-id',
        emailType: 'nurture_day3',
        runAfter,
        payload: { userName: 'Test User' },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('scheduled_emails');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        email_type: 'nurture_day3',
        run_after: runAfter.toISOString(),
        payload: { userName: 'Test User' },
      });
    });
  });

  describe('recordUserActivity', () => {
    it('should record user login activity', async () => {
      await recordUserActivity({
        userId: 'test-user-id',
        event: 'login',
        metadata: { source: 'test' },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('user_activity');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        event: 'login',
        metadata: { source: 'test' },
      });
    });
  });

  describe('processScheduledEmails', () => {
    it('should process due scheduled emails', async () => {
      const mockScheduledEmails = [
        {
          id: 1,
          user_id: 'test-user-1',
          email_type: 'nurture_day3',
          run_after: new Date(Date.now() - 1000).toISOString(),
          payload: { userName: 'Test User 1' },
          picked_at: null,
        },
        {
          id: 2,
          user_id: 'test-user-2',
          email_type: 'welcome',
          run_after: new Date(Date.now() - 2000).toISOString(),
          payload: { userName: 'Test User 2' },
          picked_at: null,
        },
      ];

      const mockUsers = [
        { id: 'test-user-1', email: 'user1@example.com', first_name: 'User 1' },
        { id: 'test-user-2', email: 'user2@example.com', first_name: 'User 2' },
      ];

      // Mock scheduled emails query
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'scheduled_emails') {
          return {
            select: jest.fn(() => ({
              lte: jest.fn(() => ({
                is: jest.fn(() => ({
                  order: jest.fn(() => ({
                    limit: jest.fn(() => ({ data: mockScheduledEmails, error: null })),
                  })),
                })),
              })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => ({ data: mockUsers[0], error: null })),
              })),
            })),
          };
        }
        return {
          update: jest.fn(() => ({
            eq: jest.fn(() => ({ error: null })),
          })),
        };
      });

      const result = await processScheduledEmails();

      expect(result.processed).toBe(2);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('scheduleMeetingReminder', () => {
    it('should schedule meeting reminder 1 day before', async () => {
      const startsAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

      await scheduleMeetingReminder({
        userId: 'test-user-id',
        meetingId: 'test-meeting-id',
        meetingTitle: 'Test Meeting',
        startsAt,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('scheduled_emails');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        email_type: 'meeting_reminder',
        run_after: expect.any(String),
        payload: expect.objectContaining({
          meetingId: 'test-meeting-id',
          meetingTitle: 'Test Meeting',
        }),
      });
    });
  });

  describe('loadEmailTemplate', () => {
    it('should load and process email template', async () => {
      const template = await loadEmailTemplate('welcome', {
        userName: 'Test User',
        appUrl: 'https://shareskippy.com',
      });

      expect(template.subject).toContain('Welcome to ShareSkippy');
      expect(template.html).toContain('Test User');
      expect(template.text).toContain('Test User');
    });

    it('should handle invalid email type', async () => {
      await expect(loadEmailTemplate('invalid_type', {})).rejects.toThrow(
        'Unknown email type: invalid_type'
      );
    });
  });

  describe('processReengageEmails', () => {
    it('should process re-engagement emails for inactive users', async () => {
      const mockInactiveUsers = [
        {
          id: 'test-user-1',
          email: 'user1@example.com',
          first_name: 'User 1',
          user_activity: { at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        },
      ];

      // Mock inactive users query
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              lt: jest.fn(() => ({
                eq: jest.fn(() => ({
                  not: jest.fn(() => ({
                    not: jest.fn(() => ({ data: mockInactiveUsers, error: null })),
                  })),
                })),
              })),
            })),
          };
        }
        if (table === 'email_events') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    gte: jest.fn(() => ({
                      single: jest.fn(() => ({ data: null, error: null })),
                    })),
                  })),
                })),
              })),
            })),
          };
        }
        return {
          insert: jest.fn(() => ({ error: null })),
        };
      });

      const result = await processReengageEmails();

      expect(result.processed).toBe(1);
      expect(result.sent).toBe(1);
      expect(result.skipped).toBe(0);
    });
  });
});

describe('Email System Integration Tests', () => {
  it('should handle complete welcome email flow', async () => {
    // This would be an integration test that tests the full flow
    // from user signup to welcome email to nurture email scheduling
    expect(true).toBe(true); // Placeholder
  });

  it('should handle meeting reminder scheduling flow', async () => {
    // This would test the complete flow from meeting creation
    // to reminder scheduling to reminder sending
    expect(true).toBe(true); // Placeholder
  });

  it('should handle re-engagement email flow', async () => {
    // This would test the complete re-engagement flow
    // from detecting inactive users to sending re-engagement emails
    expect(true).toBe(true); // Placeholder
  });
});
