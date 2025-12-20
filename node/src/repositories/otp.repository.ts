import { Pool } from 'pg';
import { OtpToken, CreateOtpDTO } from '../models/otp.model.js';
import { DatabaseError } from '../utils/errors.js';

export class OtpRepository {
  constructor(private db: Pool) {}

  async create(data: CreateOtpDTO): Promise<OtpToken> {
    try {
      const result = await this.db.query<OtpToken>(
        `INSERT INTO otp_tokens (email, otp_hash, expires_at, user_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.email, data.otp_hash, data.expires_at, data.user_id || null]
      );

      if (!result.rows[0]) {
        throw new DatabaseError('Failed to create OTP token');
      }

      return result.rows[0];
    } catch (error) {
      throw new DatabaseError(`Failed to create OTP token: ${error}`);
    }
  }

  async findLatestByEmail(email: string): Promise<OtpToken | null> {
    try {
      const result = await this.db.query<OtpToken>(
        `SELECT * FROM otp_tokens
         WHERE email = $1 AND verified = FALSE
         ORDER BY created_at DESC
         LIMIT 1`,
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError(`Failed to find OTP token: ${error}`);
    }
  }

  async incrementAttempts(id: string): Promise<void> {
    try {
      await this.db.query(
        `UPDATE otp_tokens
         SET attempts = attempts + 1
         WHERE id = $1`,
        [id]
      );
    } catch (error) {
      throw new DatabaseError(`Failed to increment OTP attempts: ${error}`);
    }
  }

  async markAsVerified(id: string): Promise<void> {
    try {
      await this.db.query(
        `UPDATE otp_tokens
         SET verified = TRUE
         WHERE id = $1`,
        [id]
      );
    } catch (error) {
      throw new DatabaseError(`Failed to mark OTP as verified: ${error}`);
    }
  }

  async invalidatePreviousOtps(email: string): Promise<void> {
    try {
      await this.db.query(
        `UPDATE otp_tokens
         SET verified = TRUE
         WHERE email = $1 AND verified = FALSE`,
        [email]
      );
    } catch (error) {
      throw new DatabaseError(`Failed to invalidate previous OTPs: ${error}`);
    }
  }

  async countRecentRequests(email: string, minutesAgo: number): Promise<number> {
    try {
      const result = await this.db.query<{ count: string }>(
        `SELECT COUNT(*) as count
         FROM otp_tokens
         WHERE email = $1
         AND created_at > NOW() - INTERVAL '1 minute' * $2`,
        [email, minutesAgo]
      );
      return parseInt(result.rows[0]?.count || '0', 10);
    } catch (error) {
      throw new DatabaseError(`Failed to count recent OTP requests: ${error}`);
    }
  }

  async deleteExpired(): Promise<number> {
    try {
      const result = await this.db.query(
        `DELETE FROM otp_tokens
         WHERE expires_at < NOW() - INTERVAL '24 hours'`
      );
      return result.rowCount || 0;
    } catch (error) {
      throw new DatabaseError(`Failed to delete expired OTPs: ${error}`);
    }
  }
}
