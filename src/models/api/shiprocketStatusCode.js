const mongoose = require("mongoose");

const model = mongoose.Schema({
  status_code: {
    type: Number,
  },
  description :{
    type: String,
  },
  default_status: {
    type: Number,
    enum: [0,1],
    default: 0,
    required: true,
  },
  created_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("shiprocket_statuscode", model);
