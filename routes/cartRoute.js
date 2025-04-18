const express = require("express");
const cartController = require("../controllers/cartController");
const route = express.Router();
const auth = require("./middleware/auth");

//middleware
route.use(auth);
route.use(express.json());
//routes
route.get("/", cartController.getCart);
route.post("/:itemid", cartController.postItem);
route.delete("/:itemid", cartController.deleteItem);
route.put("/", cartController.checkout);
module.exports = route;
