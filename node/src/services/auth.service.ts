import { UserRepository } from '../repositories/user.repository.js';
import { OtpRepository } from '../repositories/otp.repository.js';
import { EmailService } from './email.service.js';
import { TokenService } from './token.service.js';
import { generateOtp } from '../utils/otp-generator.js';
import { hashValue, compareHash } from '../utils/crypto.js';
import { RateLimitError, ValidationError, UnauthorizedError } from '../utils/errors.js';
import { env } from '../config/env.js';

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private otpRepo: OtpRepository,
    private emailService: EmailService,
    private tokenService: TokenService
  ) {}

  /**
   * Request OTP - generates and sends OTP to user's email
   * @param email - User's email address
   * @returns Success message with expiry time
   */
  async requestOtp(email: string) {
    // Check rate limit: 3 requests per 30 minutes
    const recentRequests = await this.otpRepo.countRecentRequests(
      email,
      env.OTP_RATE_LIMIT_WINDOW_MINUTES
    );

    if (recentRequests >= env.OTP_RATE_LIMIT_COUNT) {
      throw new RateLimitError(
        `Too many OTP requests. Please try again in ${env.OTP_RATE_LIMIT_WINDOW_MINUTES} minutes.`
      );
    }

    // Find or create user
    let user = await this.userRepo.findByEmail(email);
    if (!user) {
      user = await this.userRepo.create({ email });
    }

    // Generate 6-digit OTP
    const otp = generateOtp(6);

    // Hash the OTP before storing
    const otpHash = await hashValue(otp);

    // Calculate expiry time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env.OTP_EXPIRY_MINUTES);

    // Invalidate any previous unverified OTPs for this email
    await this.otpRepo.invalidatePreviousOtps(email);

    // Store OTP record
    await this.otpRepo.create({
      email,
      otp_hash: otpHash,
      expires_at: expiresAt,
      user_id: user.id,
    });

    // Send OTP via email
    await this.emailService.sendOtpEmail(email, otp);

    return {
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: env.OTP_EXPIRY_MINUTES,
    };
  }

  /**
   * Verify OTP - validates OTP and returns JWT tokens
   * @param email - User's email address
   * @param otp - The OTP code to verify
   * @returns User data and JWT tokens
   */
  async verifyOtp(email: string, otp: string) {
    // Find the latest unverified OTP for this email
    const otpRecord = await this.otpRepo.findLatestByEmail(email);

    if (!otpRecord) {
      throw new ValidationError(
        'No OTP found for this email. Please request a new one.'
      );
    }

    // Check if already verified
    if (otpRecord.verified) {
      throw new ValidationError('OTP already used. Please request a new one.');
    }

    // Check if expired
    if (new Date() > otpRecord.expires_at) {
      throw new ValidationError('OTP has expired. Please request a new one.');
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      throw new ValidationError(
        'Maximum verification attempts exceeded. Please request a new OTP.'
      );
    }

    // Verify OTP against hash
    const isValid = await compareHash(otp, otpRecord.otp_hash);

    if (!isValid) {
      // Increment failed attempts
      await this.otpRepo.incrementAttempts(otpRecord.id);
      throw new UnauthorizedError('Invalid OTP');
    }

    // Mark OTP as verified
    await this.otpRepo.markAsVerified(otpRecord.id);

    // Ensure we have a user_id (should always be present)
    if (!otpRecord.user_id) {
      throw new ValidationError('Invalid OTP record');
    }

    // Update user: mark as verified and update last login
    const user = await this.userRepo.update(otpRecord.user_id, {
      is_verified: true,
      last_login_at: new Date(),
    });

    // Generate JWT tokens
    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        is_verified: user.is_verified,
        created_at: user.created_at.toISOString(),
        last_login_at: user.last_login_at?.toISOString() || null,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900, // 15 minutes in seconds
      },
    };
  }

  /**
   * Refresh access and refresh tokens
   * @param refreshToken - The current refresh token
   * @returns New token pair
   */
  async refreshTokens(refreshToken: string) {
    // 1. Verify refresh token (throws UnauthorizedError if invalid/expired/wrong type)
    const decoded = await this.tokenService.verifyRefreshToken(refreshToken);

    // 2. Validate user still exists
    const user = await this.userRepo.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // 3. Generate new token pair (token rotation)
    const newAccessToken = this.tokenService.generateAccessToken(user.id);
    const newRefreshToken = this.tokenService.generateRefreshToken(user.id);

    return {
      success: true,
      tokens: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 900, // 15 minutes in seconds
      },
    };
  }
}
