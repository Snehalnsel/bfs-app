const mongoose = require("mongoose");

const model = mongoose.Schema({
  name: {
    type: String,
  },
  short_code: {
    type: String,
  },
  status: {
    type: Number,
    enum: [0, 1 , 2],
    default: 0,
  },
  added_dtime: {
    type: String,
  },
});

module.exports = new mongoose.model("mt_gender", model);