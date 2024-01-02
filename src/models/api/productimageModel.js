const mongoose = require("mongoose");

const model = mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_categories', 
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_userproduct', 
    required: true,
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_brands', 
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
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

module.exports = new mongoose.model("mt_product_images", model);