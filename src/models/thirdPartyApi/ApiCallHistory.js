// Userproduct Model
const mongoose = require("mongoose");

const model = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    called_for: { type: String, required: true },
    api_link: { type: String, required: true },
    api_param: { type: Object, required: true },
    api_response: { type: Object, required: true },
    send_status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3650 * 86400 }
});

module.exports = new mongoose.model("mt_api_call_history", model);
