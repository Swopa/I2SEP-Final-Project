// backend/src/utils/auth.utils.ts
import bcrypt from 'bcrypt';

const saltRounds = 10; // Or a value from environment variables for more flexibility

/**
 * Hashes a plaintext password using bcrypt.
 * @param plaintextPassword The password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export const hashPassword = async (plaintextPassword: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(plaintextPassword, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed'); // Or a more specific error
  }
};

/**
 * Compares a plaintext password with a stored bcrypt hash.
 * @param plaintextPassword The plaintext password to compare.
 * @param hashedPassword The stored hashed password.
 * @returns A promise that resolves to true if the passwords match, false otherwise.
 */
export const comparePassword = async (plaintextPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(plaintextPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    // It's generally safer not to throw an error that reveals too much,
    // but for internal server errors, logging is key.
    // For a login attempt, you'd typically just return false.
    return false; // Or throw new Error('Password comparison failed');
  }
};