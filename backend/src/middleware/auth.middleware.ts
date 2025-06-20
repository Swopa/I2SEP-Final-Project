// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtCustomPayload } from '../utils/auth.utils'; // Use JwtCustomPayload

// Extend the Express Request interface to include our 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: JwtCustomPayload; // Make user property optional on Request
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer TOKEN_STRING"

  if (token == null) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  const userPayload = verifyToken(token);

  if (!userPayload) {
    // verifyToken logs specific reasons internally (expired, invalid signature etc.)
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
  }

  req.user = userPayload; // Attach payload to request object
  next(); // Proceed to the next middleware or route handler
};