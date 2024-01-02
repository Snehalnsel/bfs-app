const mongoose = require("mongoose");

const model = mongoose.Schema({
  category_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand_id: {
    type: String,
    required: true,
  },
  condition: {
    type: Number,
    enum: [0, 1],
    default: 0,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("mt_sub_categories", model);
