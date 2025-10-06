import mongoose, { Schema } from 'mongoose';
import { ILink } from '../types/models.types';

const linkSchema: Schema<ILink> = new Schema({
  shortLink: { type: String, required: true, unique: true },
  committee_id: { type: String, default: null },
  longLink: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  created_by: { type: String, required: true },
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
