const express = require("express");
const cartController = require("../controllers/cartController");
const route = express.Router();

route.use(express.json());
route.get("/", coreController.getCart);
route.post("/:id", coreController.postItem);
route.delete("/:id", coreController.deleteItem);
route.put("/", coreController.checkout)
module.exports = route;
