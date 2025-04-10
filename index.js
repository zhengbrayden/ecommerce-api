require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')
const main = async () => {
  const app = express();
  app.use(express.json());

  const coreRoute = require("./routes/coreRoute"); //route for users
  const itemRoute = require("./routes/itemRoute"); //route for searching for items
  const cartRoute = require("./routes/cartRoute") //route for managing user carts
  const transactionRoute = require("./routes/transactionRoute")
  app.use("/", coreRoute);
  app.use("/items", itemRoute);
  app.use("/cart", cartRoute)
  app.use("/transactions", transactionRoute)

  //auth middleware
  function auth(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.id = decoded.id;
      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  }

  app.use('/cart', auth)
  app.use('/transactions', auth)

  await mongoose.connect(process.env.MONGO_URI);

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server has started on port ${port}`));
}

main()