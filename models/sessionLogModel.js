//for tracking stripe sessions
const mongoose = require("mongoose");

const sessionLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sessionId: {type: String,
        required: true}
    },
);

const SessionLog = mongoose.model("SessionLog", sessionLogSchema);

module.exports = SessionLog;
