const Transaction = require("./../models/itemModel");
const SessionLog = require("./../models/sessionLogModel")
const fulfillCheckout = require('./utils/fullfillCheckout')

//get items with pagination
const getTransactions = async (req, res) => {
    const page = Number.parseInt(req.query.page);
    const limit = Number.parseInt(req.query.limit);
    let transactions = await Transaction.find({ userid: req.id })
        .skip((page - 1) * limit)
        .limit(limit);
    transactions = transactions.map((transaction) => {
        return {
            id: transaction.id,
        };
    });
    const total = await Transaction.countDocuments({ userid: req.id });

    res.json({ data: transactions, page, limit, total });
};

const successId = async (req, res) => {
    const {sessionId } = req.params
    //validate query
    if (typeof sessionId !== "string") {
        return res.status(400).send("Invalid input"); 
    }

    await fulfillCheckout(sessionId)
    //if no error thrown
    res.status(200).send('Checkout successful, view your transaction');
}

const success =  async (req, res) => {
    const sessionLog = await SessionLog.findOne({
        user: req.id
    })

    //check if exist
    if (!sessionLog) {
        //This user doesnt have an active valid checkout
        return response.status(400).send('No checkout session found')
    }
    await fulfillCheckout(sessionLog.sessionId)
    //if no error thrown
    res.status(200).send('Checkout successful, view your transaction');

}
module.exports = { getTransactions , success, successId};
