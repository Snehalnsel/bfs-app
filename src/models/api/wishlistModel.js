const mongoose = require("mongoose");

const model = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_userproduct', 
    required: true,
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 0,
    required: true,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("app_wishlists", model);