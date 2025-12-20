import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { sendOtpBodySchema, verifyOtpBodySchema, refreshTokenBodySchema } from '../schemas/auth.schema.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Handle send OTP request
   */
  async sendOtp(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Validate request body
    const body = sendOtpBodySchema.parse(request.body);

    // Call service
    const result = await this.authService.requestOtp(body.email);

    // Send response
    return reply.code(200).send(result);
  }

  /**
   * Handle verify OTP request
   */
  async verifyOtp(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Validate request body
    const body = verifyOtpBodySchema.parse(request.body);

    // Call service
    const result = await this.authService.verifyOtp(body.email, body.otp);

    // Send response
    return reply.code(200).send(result);
  }

  /**
   * Handle refresh token request
   */
  async refreshToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Validate request body
    const body = refreshTokenBodySchema.parse(request.body);

    // Call service
    const result = await this.authService.refreshTokens(body.refresh_token);

    // Send response
    return reply.code(200).send(result);
  }
}
