const mongoose = require("mongoose");

const model = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    enum: [0, 1 , 2],
    default: 0,
    required: true,
  },
  added_dtime: {
    type: String,
    required: true,
  },
  updated_dtime: {
    type: String,
  },
});

module.exports = new mongoose.model("mt_shipping_chrgs", model);