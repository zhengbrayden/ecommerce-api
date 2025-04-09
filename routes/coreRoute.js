const express = require("express");

const route = express.Router();
route.use(express.json());
const coreController = require("../controllers/coreController");
route.get("/", coreController.frontpage);
route.post("/register", coreController.register);
route.post("/login", coreController.login);
module.exports = route;