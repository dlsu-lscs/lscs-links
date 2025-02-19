import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
  shortlink: {
    type: String,
    unique: true,
    required: true,
  },
  committee: {
    type: String,
    required: false, // not immediately required
  },
  qr_preview: {
    type: String,
    required: true,
  },
  qr_download: {
    type: String,
    required: true,
  },
  longlink: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
  created_by: {
    type: String,
    required: true,
  },
});

const linkModel = mongoose.model('shortlinks', linkSchema);

export default linkModel;

