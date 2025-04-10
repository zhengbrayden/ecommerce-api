const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: {type: Number, required: true},
    price: {type: Number, required: true},
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
