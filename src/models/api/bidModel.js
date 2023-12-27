// Userproduct Model
const mongoose = require("mongoose");

const model = mongoose.Schema({
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_userproducts', 
    required: true,
  },
  original_price: {
    type: String,
    required: true,
  },
  seller_price: {
    type: String,
    required: true,
  },
  bid_price: {
    type: Number,
     default: 0,
  },
  final_price: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    enum: [0, 1, 2],
    default: 0,
    required: true,
  },
  chat_status: {
    type: Number,
    enum: [0,1,2],
    default: 2,
    required: true,
  },
  added_dtime: {
    type: String,
    required: true,
  },
  customer_id: {
    type: String,
  },
  added_dtime: {
    type: String,
  },
});

module.exports = new mongoose.model("bid_management", model);
