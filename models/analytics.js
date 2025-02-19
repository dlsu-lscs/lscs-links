import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  link: String,
  type: String,
  accessed_at: Date,
});

const analyticsModel = mongoose.model('analytics', analyticsSchema);

export default analyticsModel;

