const express = require("express");
const transactionController = require("../controllers/transactionController");
const route = express.Router();
const auth = require("./middleware/auth");

route.use(express.json());
route.use(auth);
route.get("/", transactionController.getTransactions);
module.exports = route;
route.get('/success/:id', transactionController.successId)
route.get('/success', transactionController.success)