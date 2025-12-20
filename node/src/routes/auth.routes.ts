import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthService } from '../services/auth.service.js';
import { EmailService } from '../services/email.service.js';
import { TokenService } from '../services/token.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { OtpRepository } from '../repositories/otp.repository.js';
import { pool } from '../config/database.js';
import { sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from '../schemas/auth.schema.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // Initialize repositories
  const userRepo = new UserRepository(pool);
  const otpRepo = new OtpRepository(pool);

  // Initialize services
  const emailService = new EmailService();
  const tokenService = new TokenService();
  const authService = new AuthService(userRepo, otpRepo, emailService, tokenService);

  // Initialize controller
  const authController = new AuthController(authService);

  // POST /send-otp
  fastify.post(
    '/send-otp',
    {
      schema: sendOtpSchema,
    },
    async (request, reply) => {
      return authController.sendOtp(request, reply);
    }
  );

  // POST /verify-otp
  fastify.post(
    '/verify-otp',
    {
      schema: verifyOtpSchema,
    },
    async (request, reply) => {
      return authController.verifyOtp(request, reply);
    }
  );

  // POST /refresh-token
  fastify.post(
    '/refresh-token',
    {
      schema: refreshTokenSchema,
    },
    async (request, reply) => {
      return authController.refreshToken(request, reply);
    }
  );
}
