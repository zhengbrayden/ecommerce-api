const express = require("express");
const transactionController = require("../controllers/transactionController");
const route = express.Router();
const auth = require("./middleware/auth");

route.use(express.json());
route.use(auth);
route.get("/", transactionController.getTransactions);
route.get('/success', transactionController.success)
module.exports = route;
