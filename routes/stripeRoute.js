const express = require("express");
const stripeController = require("../controllers/stripeController");
const route = express.Router();

//middleware
route.use(express.raw({ type: "application/json" }));

route.post("/webhook", stripeController.webhook);
route.get("/success", stripeController.success)
route.get("/cancel", stripeController.cancel)

module.exports = route