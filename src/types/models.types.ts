import mongoose, {
  Document,
  StringExpressionOperatorReturningBoolean,
} from 'mongoose';

export interface ILink extends Document {
  shortLink: string;
  committee: string;
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
