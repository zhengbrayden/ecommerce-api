const Transaction = require("@root/models/transactionModel");
const asyncSessionLog = require("@root/models/asyncSessionLogModel")
const mongoose = require('mongoose')
const completeTransaction = require('@root/controllers/utils/' +
'asyncPayment/completeTransaction')
const revertTransaction = require('@root/controllers/utils/' +
'asycPayment/revertTransaction')
//get transactions with pagination
const getTransactions = async (req, res) => {
    const page = Number.parseInt(req.query.page);
    const limit = Number.parseInt(req.query.limit);

    if (Number.isNaN(page) || Number.isNaN(limit)) {
        return res.status(400).send("Invalid input");
    }

    const session = await mongoose.startSession()
    let transactions;
    let total;

    try {
        await session.withTransaction(async () => {
            transactions = await Transaction.find({})
                .session(session)
                .sort({createdAt : -1})
                .skip((page - 1) * limit)
                .limit(limit);
            total = await Transaction.countDocuments({})
                .session(session);
        })
    } catch (err) {
        session.endSession();
        console.error("Transaction error:", err);
        return res.status(400).send(err.message); 
    }

    session.endSession();
    res.json({ transactions, page, limit, total });
};

const satisfyTransaction = async (req, res) => {
    const id = req.params.id
    //validation
    if (typeof id !== 'string') {
        return res.status(400).send('Invalid input')
    }

    const transaction = await Transaction.findById(id)
    //check if awaiting payment
    if (transaction.paymentPending) {
        return res.status(400).send('Cannot satisfy unpaid transaction')
    }
    transaction.satisfied = true
    await transaction.save()
    res.status(201).send('Transaction satisfied')
}

const ProcessPaymentStatus = async (req,res) => {
    const transactionid = req.params.id
    //validation
    if (typeof id !== 'string') {
        return res.status(400).send('Invalid input')
    }

    //actually check with stripe

    const sessionLog = asyncSessionLog.findOne({
        transaction: transactionid
    })
    
    if (!sessionLog) {
        return res.status(404).send('status already processed')
    }

   const checkoutSession = await stripe.checkout.sessions.retrieve(
        sessionLog.sessionId,
        {
            expand: ["payment_intent"]
        }
    )

    const paymentIntent = checkoutSession.payment_intent

    //check if async payment has succeeded, failed, or none

    if (checkoutSession.payment_status === 'paid') {
        await completeTransaction(sessionLog.sessionId)
        res.send('Payment was successful')
    } else if (paymentIntent.status === 'processing') {
        res.send('Still waiting for payment')
    } else if (paymentIntent.status === 'canceled') {
        await revertTransaction(sessionLog.sessionId)
        res.send('Payment was unsuccessful')
    }
}
module.exports = {getTransactions, satisfyTransaction, 
ProcessPaymentStatus}