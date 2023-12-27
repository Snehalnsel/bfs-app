const mongoose = require("mongoose");

const model = mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_userproduct', 
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'app_carts', 
    required: true,
  },
  check_status: {
    type: Number,
    enum: [0, 1],
    default: 0,
    required: true,
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 0,
    required: true,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("app_cart_details", model);