import mongoose, {
  Document,
  StringExpressionOperatorReturningBoolean,
} from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

// LINK

export interface ILink extends Document {
  shortlink: string;
  longlink: string;
  committee_id: string | null;
  created_at: Date;
  created_by: string;
  pinned: boolean;
}

export interface CreateLinksRequest {
  shortlink: string; 
  longlink: string; 
  pinned?: boolean;
  committee_id?: string | null;
}

// ANALYTICS
export interface IAnalytics extends Document {
  link: String;
  type: String;
  accessed_at: Date;
}

export interface AnalyticsType {
  link: String;
  type?: 'link' | String;
  accessed_at?: Date;
}

// MEMBER PAYLOAD
export interface MemberPayload extends JwtPayload {
  email: string;
  committee_id?: string | null;
  position_name: string;
}
