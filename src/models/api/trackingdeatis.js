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
  track_response: {
    type: String,
  }, 
  track_code: {
    type: String,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("order_tracking", model);