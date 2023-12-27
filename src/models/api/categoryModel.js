const mongoose = require("mongoose");

const model = mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mt_categories', 
    default: null, 
    index: true 
  },
  status: {
    type: Number,
    enum: [0,1],
    default: 1,
  },
  priority_status: {
    type: Number,
    enum: [0,1],
    default: 0,
  },
  added_dtime: {
    type: String,
  },
  
});

module.exports = new mongoose.model("mt_categories", model);
