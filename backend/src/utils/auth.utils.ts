// backend/src/utils/auth.utils.ts
import bcrypt from 'bcrypt';
import jwt, { SignOptions, Secret, JwtPayload as OfficialJwtPayload } from 'jsonwebtoken';
import { User } from '../models/user.model'; // Ensure this path is correct

// --- Bcrypt Hashing ---
const saltRounds = 10; // Or a value from environment variables

export const hashPassword = async (plaintextPassword: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(plaintextPassword, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
};

export const comparePassword = async (plaintextPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(plaintextPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    return false; // Typically return false on comparison error in a login flow
  }
};
// --- End of Bcrypt Hashing ---


// +++ JWT Utilities +++

// IMPORTANT: Store this in an environment variable in a real application!
const DEFAULT_JWT_SECRET = 'your-very-secure-and-long-secret-key-for-dev-CHANGE-ME-AGAIN';
const JWT_SECRET: Secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

if (JWT_SECRET === DEFAULT_JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: JWT_SECRET is not set in production. Please set the JWT_SECRET environment variable.');
    process.exit(1);
} else if (JWT_SECRET === DEFAULT_JWT_SECRET && process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development_standalone_test') {
    // NODE_ENV can be set to 'development_standalone_test' when running test-jwt.ts to suppress this warning
    console.warn('WARNING: Using default JWT_SECRET. For production or shared development, set a strong JWT_SECRET environment variable!');
}

// Use a number for expiration (e.g., 1 hour = 60 * 60 = 3600 seconds)
const DEFAULT_JWT_EXPIRES_IN_SECONDS: number = 3600; // 1 hour
const JWT_EXPIRES_IN_SECONDS: number = process.env.JWT_EXPIRES_IN_SECONDS
    ? parseInt(process.env.JWT_EXPIRES_IN_SECONDS, 10)
    : DEFAULT_JWT_EXPIRES_IN_SECONDS;

// This defines YOUR custom data that you want to embed in the JWT.
export interface JwtCustomPayload {
  userId: string;
  email: string;
  // Add other custom fields here if needed later, e.g., roles
}

/**
 * Generates a JWT for a given user payload.
 * @param userPayload The data to include in the token (must include userId and email).
 * @returns The generated JWT string.
 */
export const generateToken = (userPayload: Pick<User, 'id' | 'email'>): string => {
  // The payload passed to jwt.sign will be exactly what you define here.
  const payloadToSign: JwtCustomPayload = {
    userId: userPayload.id,
    email: userPayload.email,
  };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN_SECONDS, // Using a number (seconds)
    // algorithm: 'HS256' // This is the default
  };

  try {
    const token = jwt.sign(payloadToSign, JWT_SECRET, options);
    return token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Verifies a JWT and returns your custom payload if valid.
 * @param token The JWT string to verify.
 * @returns Your custom payload (JwtCustomPayload) if the token is valid, otherwise null.
 */
export const verifyToken = (token: string): JwtCustomPayload | null => {
  try {
    // jwt.verify returns an object that includes your custom payload fields (userId, email)
    // AND standard JWT claims like 'iat' (issued at) and 'exp' (expires at).
    // We cast to `OfficialJwtPayload & JwtCustomPayload` to acknowledge all fields TypeScript might know about.
    const decoded = jwt.verify(token, JWT_SECRET) as (OfficialJwtPayload & JwtCustomPayload);

    // Return only your custom payload structure, as defined by JwtCustomPayload.
    // This makes the return type of verifyToken predictable for your application logic.
    return {
        userId: decoded.userId,
        email: decoded.email
        // Standard claims like decoded.iat and decoded.exp are also available on 'decoded' if needed elsewhere.
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
        // According to @types/jsonwebtoken, error.expiredAt is a Date object.
        console.warn('JWT verification failed: Token expired at ' + error.expiredAt.toISOString());
    } else if (error instanceof jwt.JsonWebTokenError) {
        // This catches errors like 'invalid signature', 'jwt malformed', 'jwt not active', etc.
        console.warn('JWT verification failed: Invalid token - ' + error.message);
    } else {
        // Catch any other unexpected errors during verification
        console.error('An unexpected error occurred during JWT verification:', error);
    }
    return null; // Return null for any verification failure
  }
};
// +++ End of JWT Utilities +++