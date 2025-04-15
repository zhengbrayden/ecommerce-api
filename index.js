require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')

//auth middleware
function auth(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token after 'Bearer'

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.id; // Attach user ID to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}


const main = async () => {
  const app = express();
  //middleware
  app.use(express.json());
  app.use('/cart', auth)
  app.use('/transactions', auth)

  // Error handler for bad JSON
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      console.error('Bad JSON:', err.message);
      return res.status(400).json({ error: 'Invalid JSON format in request body' });
    }
    next(err);
  });

  //router mounting
  const coreRoute = require("./routes/coreRoute"); //route for users
  const itemRoute = require("./routes/itemRoute"); //route for searching for items
  const cartRoute = require("./routes/cartRoute") //route for managing user carts
  const transactionRoute = require("./routes/transactionRoute")
  app.use("/", coreRoute);
  app.use("/items", itemRoute);
  app.use("/cart", cartRoute)
  app.use("/transactions", transactionRoute)

  await mongoose.connect(process.env.MONGO_URI);

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server has started on port ${port}`));
}

main()