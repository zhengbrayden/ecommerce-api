const sessionLogSchema = require('./schema/sessionLogSchema')
const mongoose = require('mongoose')

const asyncSessionLogSchema = new mongoose.Schema(
    {
        transaction :{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            required: true
        }
    },
);

asyncSessionLogSchema.add(sessionLogSchema)
const AsyncSessionLog = mongoose.model("AsyncSessionlog", asyncSessionLogSchema)
module.exports = AsyncSessionLog