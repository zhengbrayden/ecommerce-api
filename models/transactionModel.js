const mongoose = require("mongoose");
const cartItemSchema = require('./schema/cartItemSchema')

const transactionSchema = new mongoose.Schema(
    {
        email: String,
        cart: [cartItemSchema],
        total: Number,
        satisfied: {
            type: Boolean,
            default: false,
        },
        paymentPending: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
