const mongoose = require('../database');

const link = mongoose.Schema({
  shortlink: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: false, // not immediately required
  },
  longlink: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    required: true
  },
  created_by: {
    type: String,
    required: true
  }
});

const linkModel = mongoose.model('shortlinks', link);

module.exports = linkModel
