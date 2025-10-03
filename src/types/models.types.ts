import mongoose, { Document } from 'mongoose';

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
