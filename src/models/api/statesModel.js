const { name } = require("ejs");
const mongoose = require("mongoose");

const model = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    created_on: {
        type: String,
        required: false
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    updated_on: {
        type: String,
        required: false
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 0,
      }
});

module.exports = new mongoose.model("states",model)