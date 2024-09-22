
const mongoose = require('../database')

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /@dlsu\.edu\.ph$/
  },
  name: {
    first: String,
    last: String
  },
  password: {
    type: String,
    required: true
  },
  orgs: [
    {
      org_id: mongoose.Schema.Types.ObjectId,
      org_name: String,
      permissions: [String]
    }
  ],
  created_at: String,
  last_login: String
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel
