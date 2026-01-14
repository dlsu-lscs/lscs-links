import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { MemberPayload } from '../types/models.types';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[AuthMiddleware] Checking auth for ${req.method} ${req.path}`);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    console.log('[AuthMiddleware] No token provided');
    return res.status(401).json({
      status: 'error',
      message: '[ERROR] Token not found, authentication failed',
    });
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    if (!secret) {
      console.error('[AuthMiddleware] JWT_SECRET missing');
      throw new Error('JWT_SECRET not set in environment variables');
    }

    const decoded = jwt.verify(token, secret) as MemberPayload;
    console.log(`[AuthMiddleware] Auth successful for user: ${decoded.email}`);
    req.member = decoded; // Save decoded payload into req.member
    next();
  } catch (err) {
    console.log('[AuthMiddleware] Token verification failed:', err);
    return res.status(403).json({
      status: 'error',
      message: '[ERROR] Invalid token, access denied',
    });
  }
};

export default authMiddleware;
