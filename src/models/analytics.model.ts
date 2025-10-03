import mongoose, { Schema } from 'mongoose';
import { IAnalytics } from '../types/models.types';

const analyticsSchema: Schema<IAnalytics> = new Schema({
  link: { type: String, required: true },
  type: { type: String, required: true },
  accessed_at: { type: Date, default: Date.now },
});

const analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);

export default analytics;
