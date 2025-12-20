import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export class TokenService {
  /**
   * Generate a JWT access token
   * @param userId - The user's ID
   * @returns JWT access token
   */
  generateAccessToken(userId: string): string {
    const payload = { userId, type: 'access' };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });
  }

  /**
   * Generate a JWT refresh token
   * @param userId - The user's ID
   * @returns JWT refresh token
   */
  generateRefreshToken(userId: string): string {
    const payload = { userId, type: 'refresh' };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as any,
    });
  }

  /**
   * Verify and decode an access token
   * @param token - The JWT access token
   * @returns The decoded token payload
   */
  async verifyAccessToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string;
        type: string;
      };
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId };
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify and decode a refresh token
   * @param token - The JWT refresh token
   * @returns The decoded token payload
   */
  async verifyRefreshToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
        userId: string;
        type: string;
      };
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
