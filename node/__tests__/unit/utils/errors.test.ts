import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
  EmailError,
} from '../../../src/utils/errors.js';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should have name, message, and statusCode', () => {
      const error = new AppError('Test error', 500);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('AppError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ValidationError', () => {
    it('should have statusCode 400', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('UnauthorizedError', () => {
    it('should have statusCode 401', () => {
      const error = new UnauthorizedError('Access denied');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.name).toBe('UnauthorizedError');
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('NotFoundError', () => {
    it('should have statusCode 404', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('RateLimitError', () => {
    it('should have statusCode 429', () => {
      const error = new RateLimitError('Too many requests');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.name).toBe('RateLimitError');
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('DatabaseError', () => {
    it('should have statusCode 500', () => {
      const error = new DatabaseError('Database connection failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.name).toBe('DatabaseError');
      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('EmailError', () => {
    it('should have statusCode 500', () => {
      const error = new EmailError('Email sending failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(EmailError);
      expect(error.name).toBe('EmailError');
      expect(error.message).toBe('Email sending failed');
      expect(error.statusCode).toBe(500);
    });
  });
});
