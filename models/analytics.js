const mongoose = require('../database');

const analytics = mongoose.Schema({
  link: String,
  type: String,
  accessed_at: Date,
});

const analyticsModel = mongoose.model('analytics', analytics);

module.exports = analyticsModel
