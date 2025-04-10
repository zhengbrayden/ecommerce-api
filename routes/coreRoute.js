const express = require("express");
const coreController = require("../controllers/coreController");
const route = express.Router();

route.use(express.json());
route.get("/", coreController.frontpage);
route.post("/register", coreController.register);
route.post("/login", coreController.login);
module.exports = route;
