import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '../../../src/repositories/user.repository.js';
import { DatabaseError } from '../../../src/utils/errors.js';
import type { Pool } from 'pg';

describe('UserRepository', () => {
  let userRepo: UserRepository;
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      query: vi.fn(),
    } as unknown as Pool;

    userRepo = new UserRepository(mockPool);
  });

  describe('findByEmail()', () => {
    it('should return user if exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login_at: new Date(),
      };

      mockPool.query.mockResolvedValue({
        rows: [mockUser],
        rowCount: 1,
      });

      const result = await userRepo.findByEmail('test@test.com');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining(['test@test.com'])
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if not found', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      const result = await userRepo.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });

    it('should throw DatabaseError on query failure', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(userRepo.findByEmail('error@test.com')).rejects.toThrow(DatabaseError);
    });
  });

  describe('findById()', () => {
    it('should return user if exists', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'findby@test.com',
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
        last_login_at: null,
      };

      mockPool.query.mockResolvedValue({
        rows: [mockUser],
        rowCount: 1,
      });

      const result = await userRepo.findById('user-456');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining(['user-456'])
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if not found', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      const result = await userRepo.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('create()', () => {
    it('should insert new user and return created user', async () => {
      const createData = { email: 'new@test.com' };
      const mockCreatedUser = {
        id: 'user-new-123',
        email: 'new@test.com',
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
        last_login_at: null,
      };

      mockPool.query.mockResolvedValue({
        rows: [mockCreatedUser],
        rowCount: 1,
      });

      const result = await userRepo.create(createData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        expect.arrayContaining(['new@test.com'])
      );
      expect(result).toEqual(mockCreatedUser);
    });

    it('should pass email as-is to database', async () => {
      const createData = { email: 'UPPERCASE@TEST.COM' };
      const mockCreatedUser = {
        id: 'user-uppercase',
        email: 'UPPERCASE@TEST.COM',
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
        last_login_at: null,
      };

      mockPool.query.mockResolvedValue({
        rows: [mockCreatedUser],
        rowCount: 1,
      });

      await userRepo.create(createData);

      // Verify the query was called with the email as provided
      const queryCall = mockPool.query.mock.calls[0];
      const emailParam = queryCall[1][0];
      expect(emailParam).toBe('UPPERCASE@TEST.COM');
    });
  });

  describe('update()', () => {
    it('should update user fields and return updated user', async () => {
      const userId = 'user-update-123';
      const updateData = {
        is_verified: true,
        last_login_at: new Date(),
      };
      const mockUpdatedUser = {
        id: userId,
        email: 'update@test.com',
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login_at: updateData.last_login_at,
      };

      mockPool.query.mockResolvedValue({
        rows: [mockUpdatedUser],
        rowCount: 1,
      });

      const result = await userRepo.update(userId, updateData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.any(Array)
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should execute UPDATE query correctly', async () => {
      const userId = 'user-timestamp';
      const updateData = { is_verified: true };

      mockPool.query.mockResolvedValue({
        rows: [{
          id: userId,
          email: 'timestamp@test.com',
          is_verified: true,
          created_at: new Date(),
          updated_at: new Date(),
          last_login_at: null,
        }],
        rowCount: 1,
      });

      const result = await userRepo.update(userId, updateData);

      // Verify UPDATE query was executed
      const queryCall = mockPool.query.mock.calls[0];
      const query = queryCall[0];
      expect(query.toLowerCase()).toContain('update');
      expect(query.toLowerCase()).toContain('users');
      expect(result.is_verified).toBe(true);
    });

    it('should throw DatabaseError on query failure', async () => {
      mockPool.query.mockRejectedValue(new Error('Update failed'));

      await expect(userRepo.update('user-123', { is_verified: true })).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should use parameterized queries ($1, $2)', async () => {
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await userRepo.findByEmail('test@test.com');

      const queryCall = mockPool.query.mock.calls[0];
      const query = queryCall[0];
      const params = queryCall[1];

      // Verify query uses $1 placeholder
      expect(query).toContain('$1');
      // Verify params array exists
      expect(Array.isArray(params)).toBe(true);
      expect(params).toContain('test@test.com');
    });
  });
});
