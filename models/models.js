const mongoose = require("mongoose");

//Define item model schema
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Item = mongoose.model("Item", itemSchema);

module.exports = {Item}