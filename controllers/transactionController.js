const Transaction = require('./../models/itemModel')

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
    const total = await Transaction.countDocuments({ userid:req.id });

    res.json({ data: transactions, page, limit, total });
};

module.exports = { getTransactions };
