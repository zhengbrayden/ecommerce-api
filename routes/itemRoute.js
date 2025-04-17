const express = require("express");
const itemController = require("../controllers/itemController");

const route = express.Router();

route.use(express.json());
route.get("/", itemController.getItems);

module.exports = route;
