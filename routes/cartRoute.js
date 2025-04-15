const express = require("express");
const cartController = require("../controllers/cartController");
const route = express.Router();

route.use(express.json());
route.get("/", cartController.getCart);
route.post("/:itemid", cartController.postItem);
route.delete("/:itemid", cartController.deleteItem);
route.put("/", cartController.checkout)
module.exports = route;
