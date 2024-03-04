const mongoose = require("mongoose");

const model = mongoose.Schema({
  marchanttransactionId: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
  total_price: {
    type: Number,
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_userproducts', 
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