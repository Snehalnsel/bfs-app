const mongoose = require("mongoose");

const model = mongoose.Schema({
  order_code:{
    type: String,
    required: true,
  },
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
  payment_method: {
    type: Number,
    enum: [0, 1],
    default: 0,
    required: true,
  },
  order_status: {
    type: Number,
    enum: [0,1,2,3,4],//0 for pending 1 for processing 2 for shipped 3 for delivered 4 for canceled
    default: 0,
    required: true,
  },
  gst: {
    type: String,
    required: true,
  },
  delivery_charges: {
    type: Number,
    required: true,
  },
  discount: {
    type: String,
    required: true,
  },
  pickup_status: {
    type: Number,
    enum: [0,1,2],//0 for pending 1 for coming for pickup 2 for delivered
    default: 0,
    required: true,
  },
  pickup_awb: {
    type: String,
    default: 0,
  },
  pickup_token_number:{
    type: Number,
    default: 0,
  },
  pickup_dtime: {
    type: String,
  },
  pickup_otp: {
    type: String,
  },
  delivery_status: {
    type: Number,
    enum: [0,1,2],//0 for pending 1 for out for delivery 2 for delivered
    default: 0,
    required: true,
  },
  delivery_awb: {
    type: Number,
    default: 0,
  },
  delivery_dtime: {
    type: String,
  },
  delivery_otp: {
    type: String,
  },
  shiprocket_order_status:{
    type: String,
  },
  shiprocket_payment_status:{
    type: String,
  },
  shiprocket_order_id:{
    type: String,
  },
  shiprocket_order_status:{
    type: String,
  },
  shiprocket_shipment_id:{
    type: String,
  }, 
  shiprocket_status_code:{//0 new 1 for updated
    type: Number,
    enum: [0,1,2],
    default: 0,
  },
  shiprocket_delivery_partner:{
    type: String,
  }, 
  delete_status:{
    type: Number,
    enum: [0,1],
    default: 0,
  },
  delete_status:{
    type: Number,
    enum: [0,1],
    default: 0,
  },
  delete_by:{
    type: Number,
    enum: [0,1,2,3],
    default: 0,
  },
  is_deletedtime:{
    type: Number,
    enum: [0,1],
    default: 0,
  },
  is_return:{
    type: Number,
    enum: [0,1],
    default: 0,
  },
  bid_status:{
    type: Number,
    enum: [0,1],
    default: 0,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("mt_order", model);