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
  link: {
    type: String,
  },
  is_read: {
    enum: [0, 1],
    default: 0,
  },
  status: {
    enum: [0, 1],
    default: 0,
  },
  added_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("notifications_list", model);
