const mongoose = require("mongoose");

const model = mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_order', 
    required: true,
  },
  return_reason: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_reasonlist', 
    required: true,
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

module.exports = new mongoose.model("mt_returnorder", model);