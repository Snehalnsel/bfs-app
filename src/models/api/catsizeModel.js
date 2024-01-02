const mongoose = require("mongoose");

const model = mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_categories', 
    required: true,
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_brands', 
    required: true,
  },
  size_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_sizes', 
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

module.exports = new mongoose.model("mt_productsize", model);