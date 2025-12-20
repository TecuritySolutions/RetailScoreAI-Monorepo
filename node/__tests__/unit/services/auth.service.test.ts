import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../../src/services/auth.service.js';
import { RateLimitError, ValidationError, UnauthorizedError } from '../../../src/utils/errors.js';

// Mock dependencies
vi.mock('../../../src/utils/otp-generator.js', () => ({
  generateOtp: vi.fn(() => '123456'),
}));

vi.mock('../../../src/utils/crypto.js', () => ({
  hashValue: vi.fn(async (value: string) => `hashed_${value}`),
  compareHash: vi.fn(async (plain: string, hash: string) => hash === `hashed_${plain}`),
}));

vi.mock('../../../src/config/env.js', () => ({
  env: {
    OTP_RATE_LIMIT_COUNT: 3,
    OTP_RATE_LIMIT_WINDOW_MINUTES: 30,
    OTP_EXPIRY_MINUTES: 15,
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockOtpRepo: any;
  let mockEmailService: any;
  let mockTokenService: any;

  beforeEach(() => {
    // Reset mocks before each test
    mockUserRepo = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
    };

    mockOtpRepo = {
      countRecentRequests: vi.fn(),
      create: vi.fn(),
      invalidatePreviousOtps: vi.fn(),
      findLatestByEmail: vi.fn(),
      incrementAttempts: vi.fn(),
      markAsVerified: vi.fn(),
    };

    mockEmailService = {
      sendOtpEmail: vi.fn(),
    };

    mockTokenService = {
      generateAccessToken: vi.fn(() => 'access_token'),
      generateRefreshToken: vi.fn(() => 'refresh_token'),
    };

    authService = new AuthService(
      mockUserRepo,
      mockOtpRepo,
      mockEmailService,
      mockTokenService
    );
  });

  describe('requestOtp()', () => {
    it('should send OTP to new user email (creates user + OTP)', async () => {
      const email = 'newuser@test.com';
      mockOtpRepo.countRecentRequests.mockResolvedValue(0);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        id: 'user-123',
        email,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await authService.requestOtp(email);

      expect(mockUserRepo.create).toHaveBeenCalledWith({ email });
      expect(mockOtpRepo.invalidatePreviousOtps).toHaveBeenCalledWith(email);
      expect(mockOtpRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          otp_hash: 'hashed_123456',
          user_id: 'user-123',
        })
      );
      expect(mockEmailService.sendOtpEmail).toHaveBeenCalledWith(email, '123456');
      expect(result).toEqual({
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: 15,
      });
    });

    it('should send OTP to existing user email', async () => {
      const email = 'existing@test.com';
      mockOtpRepo.countRecentRequests.mockResolvedValue(1);
      mockUserRepo.findByEmail.mockResolvedValue({
        id: 'user-456',
        email,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await authService.requestOtp(email);

      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(mockOtpRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          user_id: 'user-456',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should throw RateLimitError if 3 requests already made in 30 min', async () => {
      const email = 'ratelimit@test.com';
      mockOtpRepo.countRecentRequests.mockResolvedValue(3);

      await expect(authService.requestOtp(email)).rejects.toThrow(RateLimitError);
      await expect(authService.requestOtp(email)).rejects.toThrow(
        'Too many OTP requests. Please try again in 30 minutes.'
      );

      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
      expect(mockOtpRepo.create).not.toHaveBeenCalled();
    });

    it('should invalidate previous unverified OTPs before creating new one', async () => {
      const email = 'test@test.com';
      mockOtpRepo.countRecentRequests.mockResolvedValue(0);
      mockUserRepo.findByEmail.mockResolvedValue({
        id: 'user-789',
        email,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await authService.requestOtp(email);

      expect(mockOtpRepo.invalidatePreviousOtps).toHaveBeenCalledWith(email);
      expect(mockOtpRepo.create).toHaveBeenCalled();
      // Verify invalidatePreviousOtps was called before create
      const invalidateCallOrder = mockOtpRepo.invalidatePreviousOtps.mock.invocationCallOrder[0];
      const createCallOrder = mockOtpRepo.create.mock.invocationCallOrder[0];
      expect(invalidateCallOrder).toBeLessThan(createCallOrder);
    });

    it('should hash OTP before storing (never store plaintext)', async () => {
      const email = 'security@test.com';
      mockOtpRepo.countRecentRequests.mockResolvedValue(0);
      mockUserRepo.findByEmail.mockResolvedValue({
        id: 'user-sec',
        email,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await authService.requestOtp(email);

      const createCall = mockOtpRepo.create.mock.calls[0][0];
      expect(createCall.otp_hash).toBe('hashed_123456');
      expect(createCall.otp_hash).not.toBe('123456');
    });

    it('should set expiry to 15 minutes from now', async () => {
      const email = 'expiry@test.com';
      const beforeTime = new Date();
      mockOtpRepo.countRecentRequests.mockResolvedValue(0);
      mockUserRepo.findByEmail.mockResolvedValue({
        id: 'user-exp',
        email,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await authService.requestOtp(email);

      const createCall = mockOtpRepo.create.mock.calls[0][0];
      const expiryTime = createCall.expires_at;
      const afterTime = new Date();
      afterTime.setMinutes(afterTime.getMinutes() + 15);

      // Expiry should be approximately 15 minutes from now (within 1 second tolerance)
      expect(expiryTime.getTime()).toBeGreaterThan(beforeTime.getTime() + 14 * 60 * 1000);
      expect(expiryTime.getTime()).toBeLessThan(afterTime.getTime() + 1000);
    });

    it('should call email service to send OTP', async () => {
      const email = 'email@test.com';
      mockOtpRepo.countRecentRequests.mockResolvedValue(0);
      mockUserRepo.findByEmail.mockResolvedValue({
        id: 'user-email',
        email,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await authService.requestOtp(email);

      expect(mockEmailService.sendOtpEmail).toHaveBeenCalledWith(email, '123456');
    });
  });

  describe('verifyOtp()', () => {
    const mockUser = {
      id: 'user-verify-123',
      email: 'verify@test.com',
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
      last_login_at: null,
    };

    const mockOtpRecord = {
      id: 'otp-123',
      user_id: 'user-verify-123',
      email: 'verify@test.com',
      otp_hash: 'hashed_123456',
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      attempts: 0,
      verified: false,
      created_at: new Date(),
    };

    it('should verify valid OTP and return user + tokens', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue(mockOtpRecord);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        is_verified: true,
        last_login_at: new Date(),
      });

      const result = await authService.verifyOtp('verify@test.com', '123456');

      expect(mockOtpRepo.markAsVerified).toHaveBeenCalledWith('otp-123');
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        'user-verify-123',
        expect.objectContaining({
          is_verified: true,
        })
      );
      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith('user-verify-123');
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith('user-verify-123');
      expect(result.success).toBe(true);
      expect(result.tokens.access_token).toBe('access_token');
      expect(result.tokens.refresh_token).toBe('refresh_token');
    });

    it('should throw ValidationError if no OTP found for email', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue(null);

      await expect(authService.verifyOtp('notfound@test.com', '123456')).rejects.toThrow(
        ValidationError
      );
      await expect(authService.verifyOtp('notfound@test.com', '123456')).rejects.toThrow(
        'No OTP found for this email'
      );
    });

    it('should throw ValidationError if OTP already verified', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue({
        ...mockOtpRecord,
        verified: true,
      });

      await expect(authService.verifyOtp('verify@test.com', '123456')).rejects.toThrow(
        ValidationError
      );
      await expect(authService.verifyOtp('verify@test.com', '123456')).rejects.toThrow(
        'OTP already used'
      );
    });

    it('should throw ValidationError if OTP expired', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue({
        ...mockOtpRecord,
        expires_at: new Date(Date.now() - 1000), // 1 second ago
      });

      await expect(authService.verifyOtp('verify@test.com', '123456')).rejects.toThrow(
        ValidationError
      );
      await expect(authService.verifyOtp('verify@test.com', '123456')).rejects.toThrow(
        'OTP has expired'
      );
    });

    it('should throw ValidationError if max attempts (5) exceeded', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue({
        ...mockOtpRecord,
        attempts: 5,
      });

      await expect(authService.verifyOtp('verify@test.com', '123456')).rejects.toThrow(
        ValidationError
      );
      await expect(authService.verifyOtp('verify@test.com', '123456')).rejects.toThrow(
        'Maximum verification attempts exceeded'
      );
    });

    it('should throw UnauthorizedError for invalid OTP', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue(mockOtpRecord);

      await expect(authService.verifyOtp('verify@test.com', '999999')).rejects.toThrow(
        UnauthorizedError
      );
      await expect(authService.verifyOtp('verify@test.com', '999999')).rejects.toThrow(
        'Invalid OTP'
      );
    });

    it('should increment attempts on failed verification', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue(mockOtpRecord);

      await expect(authService.verifyOtp('verify@test.com', '999999')).rejects.toThrow();

      expect(mockOtpRepo.incrementAttempts).toHaveBeenCalledWith('otp-123');
    });

    it('should mark OTP as verified on success', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue(mockOtpRecord);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        is_verified: true,
      });

      await authService.verifyOtp('verify@test.com', '123456');

      expect(mockOtpRepo.markAsVerified).toHaveBeenCalledWith('otp-123');
    });

    it('should update user (is_verified=true, last_login_at)', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue(mockOtpRecord);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        is_verified: true,
        last_login_at: new Date(),
      });

      await authService.verifyOtp('verify@test.com', '123456');

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        'user-verify-123',
        expect.objectContaining({
          is_verified: true,
          last_login_at: expect.any(Date),
        })
      );
    });

    it('should generate access and refresh tokens on success', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue(mockOtpRecord);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        is_verified: true,
      });

      const result = await authService.verifyOtp('verify@test.com', '123456');

      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith('user-verify-123');
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith('user-verify-123');
      expect(result.tokens).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        expires_in: 900,
      });
    });

    it('should throw ValidationError if OTP has no user_id', async () => {
      mockOtpRepo.findLatestByEmail.mockResolvedValue({
        ...mockOtpRecord,
        user_id: null,
      });

      await expect(authService.verifyOtp('verify@test.com', '123456')).rejects.toThrow(
        ValidationError
      );
      await expect(authService.verifyOtp('verify@test.com', '123456')).rejects.toThrow(
        'Invalid OTP record'
      );
    });
  });

  describe('refreshTokens()', () => {
    const mockUser = {
      id: 'user-refresh-123',
      email: 'refresh@test.com',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
      last_login_at: new Date(),
    };

    it('should refresh tokens for valid refresh token', async () => {
      mockTokenService.verifyRefreshToken = vi.fn(async () => ({ userId: 'user-refresh-123' }));
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken.mockReturnValue('new_access_token');
      mockTokenService.generateRefreshToken.mockReturnValue('new_refresh_token');

      const result = await authService.refreshTokens('valid_refresh_token');

      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
      expect(mockUserRepo.findById).toHaveBeenCalledWith('user-refresh-123');
      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith('user-refresh-123');
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith('user-refresh-123');
      expect(result).toEqual({
        success: true,
        tokens: {
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          expires_in: 900,
        },
      });
    });

    it('should throw UnauthorizedError for invalid refresh token', async () => {
      mockTokenService.verifyRefreshToken = vi.fn(async () => {
        throw new UnauthorizedError('Invalid or expired refresh token');
      });

      await expect(authService.refreshTokens('invalid_token')).rejects.toThrow(
        UnauthorizedError
      );
      await expect(authService.refreshTokens('invalid_token')).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });

    it('should throw UnauthorizedError for expired refresh token', async () => {
      mockTokenService.verifyRefreshToken = vi.fn(async () => {
        throw new UnauthorizedError('Invalid or expired refresh token');
      });

      await expect(authService.refreshTokens('expired_token')).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('should throw UnauthorizedError for access token (wrong type)', async () => {
      mockTokenService.verifyRefreshToken = vi.fn(async () => {
        throw new UnauthorizedError('Invalid token type');
      });

      await expect(authService.refreshTokens('access_token_instead')).rejects.toThrow(
        UnauthorizedError
      );
      await expect(authService.refreshTokens('access_token_instead')).rejects.toThrow(
        'Invalid token type'
      );
    });

    it('should throw UnauthorizedError if user not found', async () => {
      mockTokenService.verifyRefreshToken = vi.fn(async () => ({ userId: 'user-not-found' }));
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(authService.refreshTokens('valid_refresh_token')).rejects.toThrow(
        UnauthorizedError
      );
      await expect(authService.refreshTokens('valid_refresh_token')).rejects.toThrow(
        'User not found'
      );
    });

    it('should generate new token pair (both access and refresh)', async () => {
      mockTokenService.verifyRefreshToken = vi.fn(async () => ({ userId: 'user-refresh-123' }));
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken.mockReturnValue('new_access_token');
      mockTokenService.generateRefreshToken.mockReturnValue('new_refresh_token');

      const result = await authService.refreshTokens('old_refresh_token');

      expect(result.tokens.access_token).toBe('new_access_token');
      expect(result.tokens.refresh_token).toBe('new_refresh_token');
      expect(result.tokens.access_token).not.toBe(result.tokens.refresh_token);
    });

    it('should return success response with expires_in', async () => {
      mockTokenService.verifyRefreshToken = vi.fn(async () => ({ userId: 'user-refresh-123' }));
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await authService.refreshTokens('valid_refresh_token');

      expect(result.success).toBe(true);
      expect(result.tokens.expires_in).toBe(900);
    });
  });
});
