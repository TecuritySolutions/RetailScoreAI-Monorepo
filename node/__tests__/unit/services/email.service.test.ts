import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailService } from '../../../src/services/email.service.js';
import { EmailError } from '../../../src/utils/errors.js';

// Mock SendGrid
const mockSend = vi.fn();
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: (...args: any[]) => mockSend(...args),
  },
}));

// Mock env configuration
vi.mock('../../../src/config/env.js', () => ({
  env: {
    SENDGRID_API_KEY: 'test-sendgrid-key',
    SENDGRID_FROM_EMAIL: 'noreply@test.com',
    SENDGRID_FROM_NAME: 'Test App',
  },
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    emailService = new EmailService();
  });

  describe('sendOtpEmail()', () => {
    it('should call SendGrid with correct template', async () => {
      const email = 'user@test.com';
      const otp = '123456';

      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      await emailService.sendOtpEmail(email, otp);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          from: {
            email: 'noreply@test.com',
            name: 'Test App',
          },
          subject: 'Your OTP for RetailScore AI',
        })
      );
    });

    it('should use correct from email and name from env', async () => {
      const email = 'user@test.com';
      const otp = '654321';

      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      await emailService.sendOtpEmail(email, otp);

      const sendCall = mockSend.mock.calls[0]?.[0];
      expect(sendCall.from).toEqual({
        email: 'noreply@test.com',
        name: 'Test App',
      });
    });

    it('should include OTP in email content', async () => {
      const email = 'user@test.com';
      const otp = '999888';

      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      await emailService.sendOtpEmail(email, otp);

      const sendCall = mockSend.mock.calls[0]?.[0];
      // Check html content contains the OTP
      expect(sendCall.html).toBeDefined();
      expect(sendCall.html).toContain(otp);
    });

    it('should throw EmailError on SendGrid failure', async () => {
      const email = 'fail@test.com';
      const otp = '111222';

      mockSend.mockRejectedValue(new Error('SendGrid API error'));

      await expect(emailService.sendOtpEmail(email, otp)).rejects.toThrow(EmailError);
      await expect(emailService.sendOtpEmail(email, otp)).rejects.toThrow(
        'Failed to send OTP email'
      );
    });

    it('should format email subject correctly', async () => {
      const email = 'subject@test.com';
      const otp = '777888';

      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      await emailService.sendOtpEmail(email, otp);

      const sendCall = mockSend.mock.calls[0]?.[0];
      expect(sendCall?.subject).toBe('Your OTP for RetailScore AI');
      expect(sendCall.subject.toLowerCase()).toContain('otp');
    });
  });
});
