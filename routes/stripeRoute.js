const express = require("express");
const stripeController = require("../controllers/stripeController");
const route = express.Router();

//middleware
route.use(express.raw({ type: "application/json" }));

route.post("/webhook", stripeController.webhook);

module.exports = route