const mongoose = require("mongoose");

const model = mongoose.Schema({
  track_code: {
    type: String,
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_order', 
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_userproducts', 
  },
  shipping_address_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'addressbook_list', 
  },
  hub_address_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'hub_list', 
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_order', 
  },
  total_price: {
    type: String,
  },
  payment_method: {
    type: Number,
    enum: [0, 1],//1 for online 0 for COD
    default: 0,
  },
  order_status: {
    type: Number,
    enum: [0,1,2,3,4],//0 for pending 1 for processing 2 for shipped 3 for delivered 4 for canceled
    default: 0,
  },
  gst: {
    type: String,
  },
  delivery_charges: {
    type: Number,
  },
  discount: {
    type: String,
  },
  pickup_status: {
    type: Number,
    enum: [0,1,2],//0 for pending 1 for coming for pickup 2 for delivered
    default: 0,
  },
  pickup_awb: {
    type: String,
    default: 0,
  },
  pickup_token_number:{
    type: String,
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
  bid_status:{
    type: Number,
    enum: [0,1],
    default: 0,
  },
  added_dtime: {
    type: String,
  },
});

module.exports = new mongoose.model("shipping_kit", model);