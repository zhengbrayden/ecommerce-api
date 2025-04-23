const mongoose = require("mongoose");
//define cart sub-schema
const cartItemSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
        },
        priceAtCheckout: {
            type: Number
        },
        name: {
            type: String
        }
    },
    { _id: false },
);

module.exports = cartItemSchema;
