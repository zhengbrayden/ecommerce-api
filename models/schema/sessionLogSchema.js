
const mongoose = require('mongoose')

const sessionLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sessionId: {type: String,
        required: true,
        unique: true}
    },
);

module.exports = sessionLogSchema