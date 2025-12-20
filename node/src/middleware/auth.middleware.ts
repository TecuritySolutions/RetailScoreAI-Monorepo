import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../utils/errors.js';

/**
 * Middleware to verify JWT access token
 * Attaches user info to request if valid
 */
export async function authenticateJWT(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    // This will verify the JWT and attach decoded payload to request.user
    await request.jwtVerify();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

/**
 * Middleware to verify JWT refresh token
 */
export async function authenticateRefreshToken(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    // Verify refresh token
    await request.jwtVerify({ onlyCookie: false });
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}
