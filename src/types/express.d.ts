import { MemberPayload } from './models.types';

declare global {
  namespace Express {
    interface Request {
      member?: MemberPayload;
    }
  }
}
