const express = require("express");
const transactionController = require(
    "@root/controllers/" + "adminController/transactionController",
);
const router = express.Router();

//routes
router.get("/", transactionController.getTransactions);
router.put("/:id", transactionController.satisfyTransaction);
router.put("/process/:id", transactionController.processPaymentStatus);

module.exports = router;
