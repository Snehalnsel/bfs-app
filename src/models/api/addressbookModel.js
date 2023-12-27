const mongoose = require("mongoose");

const model = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true,
  },
  street_name: {
    type: String,
    //required: true,
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
  city_code: {
    type: String,
  },
  state_name: {
    type: String,
    required: true,
  },
  state_code: {
    type: String,
  },
  pin_code: {
    type: String,
    required: true,
  },
  address_name: {
    type: String,
  },
  shiprocket_address: {
    type: String,
  },
  shiprocket_picup_id: {
    type: String,
  },
  flag: {
    type: Number,
    enum: [0,1,2],//0 for Home, 1 for Office, 2 for OTHERS
    default: 0,
    required: true,
  },
  default_status: {
    type: Number,
    enum: [0,1],
    default: 0,
    required: true,
  },
  created_dtime: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("addressbook_list", model);
