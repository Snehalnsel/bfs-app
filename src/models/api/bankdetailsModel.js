const mongoose = require("mongoose");

const model = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
  accountnumber: {
    type: String,
  },
  bankname: {
    type: String,
  },
  ifsccode: {
    type: String,
  },
  accounttype: {
    type: String,
  },
  upiid: {
    type: String,
  },
  upiid_scaner: {
    type: String,
  },
  default_status: {
    type: Number,
    enum: [0,1],
    default: 1,
    required: true,
  },
  created_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("bankdetails_list", model);
