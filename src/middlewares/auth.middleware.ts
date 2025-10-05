import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface MemberPayload extends JwtPayload {
  email: String;
  committee_id: String;
  position_name: String;
}

// Extend Express Request type so `req.member` is allowed
declare module 'express-serve-static-core' {
  interface Request {
    member?: MemberPayload;
  }
}

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
