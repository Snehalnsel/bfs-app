const mongoose = require("mongoose");

const model = mongoose.Schema({
  token: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  created_dtime: {
    type: String,
    required: false,
  },
  last_login: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  last_logout: {
    type: String,
    required: false,
  },
  status: {
    type: Number,
    required: false,
  },
});

module.exports = new mongoose.model("admin_users", model);
