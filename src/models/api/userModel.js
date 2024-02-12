const mongoose = require("mongoose");

const model = mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  phone_no: {
    type: String,
    required: true,
  },
  deviceid: {
    type: String,
  },
  devicename: {
    type: String,
  },
  fcm_token: {
    type: String,
  },
  country: {
    type: String,
  },
  country_code: {
    type: String,
  },
  created_dtime: {
    type: String,
    required: true,
  },
  trial_end_date: {
    type: String,
    required: true,
  },
  last_login: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  app_user_id: {
    type: String,
  },
  last_logout: {
    type: String,
  },
  forget_otp: {
    type: String,
  },
  ip_address: {
    type: String,
  },
  status: {
    type: Number,
    enum: [0, 1 , 2],
    default: 0,
    required: true,
  },
});

module.exports = new mongoose.model("users", model);
