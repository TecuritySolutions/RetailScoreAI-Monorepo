import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OtpRepository } from '../../../src/repositories/otp.repository.js';
import { DatabaseError } from '../../../src/utils/errors.js';
import type { Pool } from 'pg';

describe('OtpRepository', () => {
  let otpRepo: OtpRepository;
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      query: vi.fn(),
    } as unknown as Pool;

    otpRepo = new OtpRepository(mockPool);
  });

  describe('create()', () => {
    it('should insert new OTP record', async () => {
      const createData = {
        email: 'otp@test.com',
        otp_hash: 'hashed_123456',
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
        user_id: 'user-123',
      };

      const mockCreatedOtp = {
        id: 'otp-123',
        ...createData,
        attempts: 0,
        verified: false,
        created_at: new Date(),
      };

      mockPool.query.mockResolvedValue({
        rows: [mockCreatedOtp],
        rowCount: 1,
      });

      const result = await otpRepo.create(createData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        expect.arrayContaining(['otp@test.com', 'hashed_123456', createData.expires_at, 'user-123'])
      );
      expect(result).toEqual(mockCreatedOtp);
    });
  });

  describe('findLatestByEmail()', () => {
    it('should return most recent unverified OTP', async () => {
      const mockOtp = {
        id: 'otp-latest',
        email: 'latest@test.com',
        otp_hash: 'hash123',
        expires_at: new Date(),
        attempts: 0,
        verified: false,
        user_id: 'user-456',
        created_at: new Date(),
      };

      mockPool.query.mockResolvedValue({
        rows: [mockOtp],
        rowCount: 1,
      });

      const result = await otpRepo.findLatestByEmail('latest@test.com');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining(['latest@test.com'])
      );
      // Query should order by created_at DESC and limit 1
      const query = mockPool.query.mock.calls[0][0];
      expect(query.toLowerCase()).toContain('order by');
      expect(query.toLowerCase()).toContain('limit');
      expect(result).toEqual(mockOtp);
    });

    it('should return null if none found', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      const result = await otpRepo.findLatestByEmail('notfound@test.com');

      expect(result).toBeNull();
    });
  });

  describe('markAsVerified()', () => {
    it('should update verified=true', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
      });

      await otpRepo.markAsVerified('otp-verify-123');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.arrayContaining(['otp-verify-123'])
      );

      const query = mockPool.query.mock.calls[0][0];
      expect(query.toLowerCase()).toContain('verified');
      expect(query.toLowerCase()).toContain('true');
    });
  });

  describe('incrementAttempts()', () => {
    it('should increase attempts by 1', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
      });

      await otpRepo.incrementAttempts('otp-attempts-123');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.arrayContaining(['otp-attempts-123'])
      );

      const query = mockPool.query.mock.calls[0][0];
      expect(query.toLowerCase()).toContain('attempts');
      expect(query.toLowerCase()).toContain('+');
    });
  });

  describe('invalidatePreviousOtps()', () => {
    it('should mark all previous OTPs as verified', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 3,
      });

      await otpRepo.invalidatePreviousOtps('invalidate@test.com');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.arrayContaining(['invalidate@test.com'])
      );

      const query = mockPool.query.mock.calls[0][0];
      expect(query.toLowerCase()).toContain('verified');
      expect(query.toLowerCase()).toContain('where');
      expect(query.toLowerCase()).toContain('email');
    });
  });

  describe('countRecentRequests()', () => {
    it('should count OTPs within time window', async () => {
      const windowMinutes = 30;
      mockPool.query.mockResolvedValue({
        rows: [{ count: '3' }],
        rowCount: 1,
      });

      const result = await otpRepo.countRecentRequests('count@test.com', windowMinutes);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.any(Array)
      );

      const query = mockPool.query.mock.calls[0][0];
      const params = mockPool.query.mock.calls[0][1];

      // Query should filter by email and time window
      expect(query.toLowerCase()).toContain('count');
      expect(query.toLowerCase()).toContain('where');
      expect(params).toContain('count@test.com');
      expect(result).toBe(3);
    });

    it('should return 0 if no recent requests', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1,
      });

      const result = await otpRepo.countRecentRequests('none@test.com', 30);

      expect(result).toBe(0);
    });
  });

  describe('Timestamp Handling', () => {
    it('should handle timezone-aware timestamps correctly', async () => {
      const createData = {
        email: 'timezone@test.com',
        otp_hash: 'hash',
        expires_at: new Date('2025-12-20T10:30:00Z'),
        user_id: 'user-tz',
      };

      mockPool.query.mockResolvedValue({
        rows: [{
          id: 'otp-tz',
          ...createData,
          attempts: 0,
          verified: false,
          created_at: new Date(),
        }],
        rowCount: 1,
      });

      await otpRepo.create(createData);

      const params = mockPool.query.mock.calls[0][1];
      // Verify expires_at is passed as Date object (PostgreSQL will handle timezone)
      expect(params[2]).toBeInstanceOf(Date);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should use parameterized queries', async () => {
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await otpRepo.findLatestByEmail('test@test.com');

      const queryCall = mockPool.query.mock.calls[0];
      const query = queryCall[0];
      const params = queryCall[1];

      // Verify query uses $1 placeholder
      expect(query).toContain('$1');
      // Verify params array exists
      expect(Array.isArray(params)).toBe(true);
    });
  });

  describe('Database Error Handling', () => {
    it('should throw DatabaseError on query failure', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(otpRepo.findLatestByEmail('error@test.com')).rejects.toThrow(DatabaseError);
    });
  });
});
