const mongoose = require("mongoose");
//define cart sub-schema
const cartItemSchema = new mongoose.Schema(
    {
        itemid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
        },
    },
    { _id: false },
);

module.exports = cartItemSchema;
