const mongoose = require("mongoose");

const model = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hub_name: {
    type: String,
    required: true,
  },
  street_name: {
    type: String,
    required: true,
  },
  address1: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
  },
  city_name: {
    type: String,
    required: true,
  },
  state_name: {
    type: String,
    required: true,
  },
  pin_code: {
    type: String,
    required: true,
  },
  gst_no: {
    type: String,
    //required: true,
  },
  phone_no: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  shiprocket_address: {
    type: String,
  },
  shiprocket_picup_id: {
    type: String,
  },
  flag: {
    type: Number,
    enum: [0,1],
    default: 1,
    required: true,
  },
  created_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("hub_list", model);
