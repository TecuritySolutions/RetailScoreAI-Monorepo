import crypto from 'crypto';

/**
 * Generate a secure random OTP (One-Time Password)
 * @param length - Length of the OTP (default: 6)
 * @returns A string of random digits
 */
export function generateOtp(length: number = 6): string {
  // Use crypto.randomInt for cryptographically secure random numbers
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }

  return otp;
}
