const Transaction = require("./../models/transactionModel");
const SessionLog = require("./../models/sessionLogModel");
const fulfillCheckout = require("./utils/fullfillCheckout");
const mongoose = require("mongoose");
const User = require('../models/userModel')

//get transactions with pagination
const getTransactions = async (req, res) => {
    const page = Number.parseInt(req.query.page);
    const limit = Number.parseInt(req.query.limit);

    if (Number.isNaN(page) || Number.isNaN(limit)) {
        return res.status(400).send("Invalid input");
    }

    const session = await mongoose.startSession();
    let transactions;
    let total;

    try {
        await session.withTransaction(async () => {
            const email = (await User.findById(req.id).session(session))
                .email
            transactions = await Transaction.find({ email })
                .session(session)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
            total = await Transaction.countDocuments({ email }).session(
                session,
            );
        });
    } catch (err) {
        session.endSession();
        console.error("Transaction error:", err);
        return res.status(400).send(err.message);
    }

    session.endSession();
    res.json({ transactions, page, limit, total });
};

const success = async (req, res) => {
    const sessionLog = await SessionLog.findOne({
        user: req.id,
    });

    //check if exist
    if (!sessionLog) {
        //This user doesnt have an active valid checkout
        return response.status(400).send("No checkout session found");
    }
    await fulfillCheckout(sessionLog.sessionId);
    //if no error thrown
    res.status(200).send("Checkout successful, view your transaction");
};
module.exports = { getTransactions, success };
