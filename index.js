require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const main = async () => {
  const app = express();
  app.use(express.json());

  const coreRoute = require("./routes/coreRoute"); //route for users
  app.use("/", coreRoute);
  const itemRoute = require("./routes/itemRoute"); //route for searching for items
  app.use("/items", itemRoute);

  await mongoose.connect(process.env.MONGO_URI);

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server has started on port ${port}`));
}

main()