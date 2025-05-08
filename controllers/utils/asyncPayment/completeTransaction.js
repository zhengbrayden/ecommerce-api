const mongoose = require("mongoose");
const AsyncSessionLog = require("@root/models/asyncSessionLogModel");

const completeTransaction = async (sessionId) => {
    //just delete the async session log and also reset payment pending
    const sessionLog = await AsyncSessionLog.findOne({
        sessionId,
    }).populate({ path: "transaction" });

    if (!sessionLog) {
        return;
    }

    const transaction = sessionLog.transaction;
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            transaction.paymentPending = false;
            await transaction.save({ session });
            await sessionLog.deleteOne({ session });
        });
    } catch (err) {
        session.endSession();
        throw err;
    }

    session.endSession();
};

module.exports = completeTransaction;
