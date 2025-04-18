const mongoose = require("mongoose");
const cartItemSchema = require("./subSchema/cartItemSchema");

const transactionSchema = new mongoose.Schema(
    {
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        cart: [cartItemSchema],
        stripeSessionId: String,
    },
    { timestamps: true },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
