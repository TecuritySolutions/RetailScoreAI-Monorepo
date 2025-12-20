import { describe, it, expect, beforeAll, vi } from 'vitest';
import { TokenService } from '../../../src/services/token.service.js';
import jwt from 'jsonwebtoken';

// Mock env configuration
vi.mock('../../../src/config/env.js', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test-access-secret-key-minimum-32-chars-long',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-minimum-32-chars-long',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
  },
}));

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeAll(() => {
    tokenService = new TokenService();
  });

  describe('generateAccessToken()', () => {
    it('should create valid JWT with userId and type="access"', () => {
      const userId = 'test-user-id-123';
      const token = tokenService.generateAccessToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Decode token to verify payload
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(userId);
      expect(decoded.type).toBe('access');
    });
  });

  describe('generateRefreshToken()', () => {
    it('should create valid JWT with userId and type="refresh"', () => {
      const userId = 'test-user-id-456';
      const token = tokenService.generateRefreshToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Decode token to verify payload
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(userId);
      expect(decoded.type).toBe('refresh');
    });
  });

  describe('verifyAccessToken()', () => {
    it('should decode valid access token and return userId', async () => {
      const userId = 'test-user-id-789';
      const token = tokenService.generateAccessToken(userId);

      const result = await tokenService.verifyAccessToken(token);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
    });

    it('should reject refresh token (wrong type)', async () => {
      const userId = 'test-user-id-999';
      const refreshToken = tokenService.generateRefreshToken(userId);

      await expect(tokenService.verifyAccessToken(refreshToken)).rejects.toThrow(
        'Invalid or expired access token'
      );
    });

    it('should reject expired access token', async () => {
      const userId = 'test-user-id-expired';

      // Create token with 1ms expiry
      const expiredToken = jwt.sign(
        { userId, type: 'access' },
        'test-access-secret-key-minimum-32-chars-long',
        { expiresIn: '1ms' }
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));

      await expect(tokenService.verifyAccessToken(expiredToken)).rejects.toThrow(
        'Invalid or expired access token'
      );
    });

    it('should reject invalid/malformed token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(tokenService.verifyAccessToken(invalidToken)).rejects.toThrow(
        'Invalid or expired access token'
      );
    });
  });

  describe('verifyRefreshToken()', () => {
    it('should decode valid refresh token and return userId', async () => {
      const userId = 'test-user-id-refresh-123';
      const token = tokenService.generateRefreshToken(userId);

      const result = await tokenService.verifyRefreshToken(token);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
    });

    it('should reject access token (wrong type)', async () => {
      const userId = 'test-user-id-access-999';
      const accessToken = tokenService.generateAccessToken(userId);

      await expect(tokenService.verifyRefreshToken(accessToken)).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });

    it('should reject expired refresh token', async () => {
      const userId = 'test-user-id-expired-refresh';

      // Create token with 1ms expiry
      const expiredToken = jwt.sign(
        { userId, type: 'refresh' },
        'test-refresh-secret-key-minimum-32-chars-long',
        { expiresIn: '1ms' }
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));

      await expect(tokenService.verifyRefreshToken(expiredToken)).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });
  });
});
