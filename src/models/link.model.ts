import mongoose, { Schema } from 'mongoose';
import { ILink } from '../types/models.types';

const linkSchema: Schema<ILink> = new Schema({
  shortLink: {
    type: String,
    required: true,
    unique: true,
    maxlength: [100, 'Short link cannot exceed 100 characters'],
  },
  committee_id: { type: String, default: null, max_length: 100 },
  longLink: {
    type: String,
    required: true,
    maxlength: [2500, 'Long link cannot exceed 2500 characters'],
  },
  created_at: { type: Date, default: Date.now },
  created_by: { type: String, required: true, max_length: 100 },
  pinned: {
    type: Boolean,
    default: false,
    validate: {
      validator: function (this: ILink) {
        return !(this.pinned && this.committee_id === null);
      },
      message: 'Personal links (committee_id = NULL) cannot be pinned.',
    },
  },
});

const linkModel = mongoose.model<ILink>('Link', linkSchema);

export default linkModel;
