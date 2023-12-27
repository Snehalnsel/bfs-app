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
  order_code: {
    type: String,
  }, 
  track_code: {
    type: String,
  },
  status: {
    type: Number,
    enum: [0,1,2,3,4,5],//0 for seller_to_hub 1 for hub_to_buyer 2 for buyer_to_hub 3 for hub_to_seller 4 for hub_to_seller_return direct
    default: 0,
    required: true,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("order_tracking", model);