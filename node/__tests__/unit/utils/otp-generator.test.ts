import { describe, it, expect } from 'vitest';
import { generateOtp } from '../../../src/utils/otp-generator.js';

describe('OTP Generator', () => {
  describe('generateOtp()', () => {
    it('should return a 6-digit string', () => {
      const otp = generateOtp(6);

      expect(otp).toBeDefined();
      expect(typeof otp).toBe('string');
      expect(otp.length).toBe(6);
    });

    it('should only contain numeric characters (0-9)', () => {
      const otp = generateOtp(6);

      expect(otp).toMatch(/^\d+$/);
    });

    it('should generate different values on multiple calls (randomness)', () => {
      const otps = new Set();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        otps.add(generateOtp(6));
      }

      // With 1,000,000 possible 6-digit combinations,
      // 100 generations should produce >95 unique values
      expect(otps.size).toBeGreaterThan(95);
    });

    it('should handle different lengths (4, 6, 8 digits)', () => {
      const otp4 = generateOtp(4);
      const otp6 = generateOtp(6);
      const otp8 = generateOtp(8);

      expect(otp4.length).toBe(4);
      expect(otp6.length).toBe(6);
      expect(otp8.length).toBe(8);

      expect(otp4).toMatch(/^\d{4}$/);
      expect(otp6).toMatch(/^\d{6}$/);
      expect(otp8).toMatch(/^\d{8}$/);
    });

    it('should not generate values with leading zeros issue', () => {
      // Generate multiple OTPs and ensure proper format
      for (let i = 0; i < 50; i++) {
        const otp = generateOtp(6);
        expect(otp.length).toBe(6);
        expect(parseInt(otp, 10)).toBeGreaterThanOrEqual(0);
        expect(parseInt(otp, 10)).toBeLessThan(1000000);
      }
    });
  });
});
