import mongoose, {
  Document,
  StringExpressionOperatorReturningBoolean,
} from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

export interface ILink extends Document {
  shortLink: string;
  committee_id: string;
  longLink: string;
  created_at: Date;
  created_by: string;
}

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

export interface MemberPayload extends JwtPayload {
  email: string;
  committee_id: string;
  position_name: string;
}
