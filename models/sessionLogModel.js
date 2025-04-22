//for tracking stripe sessions
const mongoose = require("mongoose");
const sessionLogSchema = require('./schema/sessionLogSchema')

const SessionLog = mongoose.model("SessionLog", sessionLogSchema);

module.exports = SessionLog;
