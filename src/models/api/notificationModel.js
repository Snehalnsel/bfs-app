const mongoose = require("mongoose");

const model = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
  data: {
    type: String,
    default: null, 
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("notifications_list", model);