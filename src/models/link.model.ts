import mongoose, { Schema } from 'mongoose';
import { ILink } from '../types/models.types';

const linkSchema: Schema<ILink> = new Schema({
  shortLink: { type: String, required: true, unique: true },
  committee: { type: String, required: true },
  longLink: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  created_by: { type: String, required: true },
});

const linkModel = mongoose.model<ILink>('Link', linkSchema);

export default linkModel;
