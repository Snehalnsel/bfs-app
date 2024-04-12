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
  track_awbno: {
    type: String,
  },
  status:{
    type: Number,
    enum: [0,1,2,3,4],//0 for SBFS 1 for BFSB 2 for BBFSR 3 for BFSSR 4 for BFSSRF
    default: 0,
    required: true,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("tracking_orderflow", model);