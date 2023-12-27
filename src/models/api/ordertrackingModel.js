const mongoose = require("mongoose");

const model = mongoose.Schema({
  order_track_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_orders', 
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_ordertrack', 
  },
  order_status: {
    type: Number,
    enum: [0,1,2,3,4],//0 for seller_to_hub 1 for hub_to_buyer 2 for buyer_to_hub 3 for hub_to_seller 4 for hub_to_seller_return direct
    default: 0,
    required: true,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("ordertracking", model);