import { MemberPayload } from './models.types';

declare module 'express' {
  interface Request {
    member?: MemberPayload;
  }
}
