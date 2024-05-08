const mongoose = require("mongoose");

const model = mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_order', 
    required: true,
  },
  tracking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_track', 
    required: true,
  },
  awb_no:{
    type: String,
  },
  shiprocket_shipment_id:{
    type: String,
  },
  shiprocket_order_id:{
    type: String,
  },
  response_status:{
    type: String,
  },
  status:{
    type: Number,
    enum: [0,1],
    default: 0,
    required: true,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("mt_orderdelivered", model);