import { describe, it, expect } from 'vitest';
import { hashValue, compareHash } from '../../../src/utils/crypto.js';

describe('Crypto Utils', () => {
  describe('hashValue()', () => {
    it('should hash a plain string successfully', async () => {
      const plainText = 'test123';
      const hash = await hashValue(plainText);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plainText);
      expect(typeof hash).toBe('string');
    });

    it('should produce different hashes for same input (salt randomness)', async () => {
      const plainText = 'test123';
      const hash1 = await hashValue(plainText);
      const hash2 = await hashValue(plainText);

      expect(hash1).not.toBe(hash2);
      expect(hash1.length).toBe(60); // bcrypt hash length
      expect(hash2.length).toBe(60);
    });

    it('should handle empty strings', async () => {
      const plainText = '';
      const hash = await hashValue(plainText);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(60);
    });
  });

  describe('compareHash()', () => {
    it('should return true for matching plain text and hash', async () => {
      const plainText = 'password123';
      const hash = await hashValue(plainText);

      const result = await compareHash(plainText, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching plain text and hash', async () => {
      const plainText = 'password123';
      const wrongText = 'wrong password';
      const hash = await hashValue(plainText);

      const result = await compareHash(wrongText, hash);
      expect(result).toBe(false);
    });

    it('should handle invalid hash format gracefully', async () => {
      const plainText = 'test123';
      const invalidHash = 'not-a-valid-hash';

      const result = await compareHash(plainText, invalidHash);
      expect(result).toBe(false);
    });
  });
});
