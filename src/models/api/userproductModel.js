// Userproduct Model
const mongoose = require("mongoose");

const model = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_categories', 
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_brands', 
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
  size_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_sizes', 
  },
  gender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_gender', 
  },
  price: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
  },
  size: {
    type: String,
  },
  category: {
    type: String,
  },
  height: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  length: {
    type: Number,
  },
  breath: {
    type: Number,
  },
  offer_price: {
    type: Number,
    required: true,
  },
  final_price: {
    type: Number,
    default: '0',
  },
  reseller_price: {
    type: Number,
    default: '0',
  },
  percentage: {
    type: String, 
    required: true, 
    default: '0',
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_productcondition', 
    required: true,
  },
  flag: {
    type: Number,
    enum: [0,1,2,3],
    default: 0,
    required: true,
  },
  approval_status: {
    type: Number,
    enum: [0,1,2],
    default: 0,
    required: true,
  },
  bid_status: {
    type: Number,
    enum: [0,1],
    default: 0,
  },
  original_invoice: {
    type: Number,
    enum: [0,1],
    default: 0,
  },
  original_packaging: {
    type: Number,
    enum: [0,1],
    default: 0,
  },
  hitCount: {
    type: Number,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("mt_userproducts", model);