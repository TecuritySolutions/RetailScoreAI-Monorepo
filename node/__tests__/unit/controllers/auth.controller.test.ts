import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from '../../../src/controllers/auth.controller.js';
import { ValidationError } from '../../../src/utils/errors.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: any;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockAuthService = {
      requestOtp: vi.fn(),
      verifyOtp: vi.fn(),
    };

    authController = new AuthController(mockAuthService);

    mockRequest = {
      body: {},
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe('sendOtp()', () => {
    it('should validate request body with Zod schema', async () => {
      mockRequest.body = { email: 'test@test.com' };

      mockAuthService.requestOtp.mockResolvedValue({
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: 15,
      });

      await authController.sendOtp(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockAuthService.requestOtp).toHaveBeenCalledWith('test@test.com');
    });

    it('should call authService.requestOtp() with email', async () => {
      mockRequest.body = { email: 'service@test.com' };

      mockAuthService.requestOtp.mockResolvedValue({
        success: true,
        message: 'OTP sent',
        expiresIn: 15,
      });

      await authController.sendOtp(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockAuthService.requestOtp).toHaveBeenCalledWith('service@test.com');
      expect(mockAuthService.requestOtp).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with success response', async () => {
      mockRequest.body = { email: 'success@test.com' };

      const mockResponse = {
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: 15,
      };

      mockAuthService.requestOtp.mockResolvedValue(mockResponse);

      await authController.sendOtp(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
    });

    it('should throw ValidationError for invalid email', async () => {
      mockRequest.body = { email: 'invalid-email' };

      await expect(
        authController.sendOtp(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow();
    });

    it('should throw ValidationError for missing email', async () => {
      mockRequest.body = {};

      await expect(
        authController.sendOtp(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow();
    });
  });

  describe('verifyOtp()', () => {
    it('should validate request body with Zod schema', async () => {
      mockRequest.body = {
        email: 'verify@test.com',
        otp: '123456',
      };

      mockAuthService.verifyOtp.mockResolvedValue({
        success: true,
        user: { id: 'user-123', email: 'verify@test.com' },
        tokens: { access_token: 'token', refresh_token: 'refresh' },
      });

      await authController.verifyOtp(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith('verify@test.com', '123456');
    });

    it('should call authService.verifyOtp() with email and OTP', async () => {
      mockRequest.body = {
        email: 'service@test.com',
        otp: '654321',
      };

      mockAuthService.verifyOtp.mockResolvedValue({
        success: true,
        user: { id: 'user-456' },
        tokens: {},
      });

      await authController.verifyOtp(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith('service@test.com', '654321');
      expect(mockAuthService.verifyOtp).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with user and tokens', async () => {
      mockRequest.body = {
        email: 'tokens@test.com',
        otp: '999888',
      };

      const mockResponse = {
        success: true,
        user: {
          id: 'user-789',
          email: 'tokens@test.com',
          is_verified: true,
          created_at: '2025-12-20T10:00:00Z',
          last_login_at: '2025-12-20T10:05:00Z',
        },
        tokens: {
          access_token: 'jwt_access',
          refresh_token: 'jwt_refresh',
          expires_in: 900,
        },
      };

      mockAuthService.verifyOtp.mockResolvedValue(mockResponse);

      await authController.verifyOtp(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
    });

    it('should throw ValidationError for invalid email', async () => {
      mockRequest.body = {
        email: 'not-an-email',
        otp: '123456',
      };

      await expect(
        authController.verifyOtp(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow();
    });

    it('should throw ValidationError for invalid OTP format', async () => {
      mockRequest.body = {
        email: 'valid@test.com',
        otp: '12345', // Only 5 digits
      };

      await expect(
        authController.verifyOtp(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow();
    });

    it('should throw ValidationError for non-numeric OTP', async () => {
      mockRequest.body = {
        email: 'valid@test.com',
        otp: 'abcdef',
      };

      await expect(
        authController.verifyOtp(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow();
    });

    it('should throw ValidationError for missing email or OTP', async () => {
      mockRequest.body = { email: 'test@test.com' }; // Missing OTP

      await expect(
        authController.verifyOtp(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow();

      mockRequest.body = { otp: '123456' }; // Missing email

      await expect(
        authController.verifyOtp(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow();
    });
  });
});
