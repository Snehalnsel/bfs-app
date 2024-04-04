const mongoose = require("mongoose");

const model = mongoose.Schema({
  reason: {
    type: String,
  },
  reason_status:{
    type: Number,
    enum: [0,1,2],
    default: 0,
  },
  status:{
    type: Number,
    enum: [0,1],
    default: 0,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("mt_reasonlist", model);