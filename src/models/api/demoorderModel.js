const mongoose = require("mongoose");

const model = mongoose.Schema({
  user_id: {
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
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'app_carts', 
  },
  billing_address_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'addressbook_list', 
  },
  shipping_address_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'addressbook_list', 
  },
  hub_address_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'hub_list', 
  },
  total_price: {
    type: Number,
    required: true,
  },
  pay_now: {
    type: Number,
    default: 0,
  },
  remaining_amount: {
    type: Number,
    default: 0,
  },
  payment_method: {
    type: Number,
    enum: [0, 1],
    default: 0,
    required: true,
  },
  status: {
    type: Number,
    enum: [0,1,2],
    default: 0,
    required: true,
  },
  pay_response: {
    type: Object,
  },
  checkstatus_response: {
    type: Object,
  },
  checkstatus_status: {
    type: String,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("demoorder", model);