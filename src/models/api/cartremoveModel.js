const mongoose = require("mongoose");

const model = mongoose.Schema({
  name: {
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
});

module.exports = new mongoose.model("cart_remove_time", model);