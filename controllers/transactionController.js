const Transaction = require("./../models/itemModel");
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

const success = async (req, res) => {
    const {sessionId } = req.query
    //validate query
    if (typeof sessionId !== "string") {
        return res.status(400).send("Invalid input"); 
    }

    fulfillCheckout(sessionId)
    response.status(200).send('order was successful. View your transaction');
}

module.exports = { getTransactions , success};
