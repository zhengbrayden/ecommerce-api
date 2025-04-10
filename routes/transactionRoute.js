const express = require("express");
const transactionController = require("../controllers/transactionController");
const route = express.Router();

route.use(express.json());
route.get("/", transactionController.getTransactions);
module.exports = route;
