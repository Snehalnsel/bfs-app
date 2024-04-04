const mongoose = require("mongoose");

const model = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
  purpose: {
    type: String,
  },
  ip_address: {
    type: String,
  },
  created_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("ip_transactions", model);
