import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a value using bcrypt
 * @param value - The plaintext value to hash
 * @returns The bcrypt hash
 */
export async function hashValue(value: string): Promise<string> {
  return bcrypt.hash(value, SALT_ROUNDS);
}

/**
 * Compare a plaintext value with a bcrypt hash
 * @param value - The plaintext value
 * @param hash - The bcrypt hash to compare against
 * @returns True if the value matches the hash, false otherwise
 */
export async function compareHash(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}
