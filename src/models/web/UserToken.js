// Userproduct Model
const mongoose = require("mongoose");

const model = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    refresh_token: { type: String, required: true },
    access_token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3650 * 86400 }
});

module.exports = new mongoose.model("mt_admintoken", model);
