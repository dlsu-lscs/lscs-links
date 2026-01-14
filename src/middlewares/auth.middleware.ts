import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { MemberPayload } from '../types/models.types';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: '[ERROR] Token not found, authentication failed',
    });
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    if (!secret) {
      throw new Error('JWT_SECRET not set in environment variables');
    }

    const decoded = jwt.verify(token, secret) as MemberPayload;
    req.member = decoded; // Save decoded payload into req.member
    next();
  } catch (err) {
    return res.status(403).json({
      status: 'error',
      message: '[ERROR] Invalid token, access denied',
    });
  }
};

export default authMiddleware;
