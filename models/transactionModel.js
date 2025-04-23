const mongoose = require("mongoose");
const cartItemSchema = require('./schema/cartItemSchema')
//except instead of using the item, we will use the 
const transactionSchema = new mongoose.Schema(
    {
        email: String,
        cart: [cartItemSchema],
        total: Number
    },
    { timestamps: true },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
