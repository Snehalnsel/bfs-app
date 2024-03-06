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
  total_price: {
    type: Number,
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
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("demoorder", model);