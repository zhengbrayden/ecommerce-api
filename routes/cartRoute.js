const express = require("express");
const cartController = require("../controllers/cartController");
const route = express.Router();
const auth = require("./middleware/auth");

//middleware
route.use(auth);
route.use(express.json());
//routes
route.get("/", cartController.getCart);
route.post("/", cartController.checkout);
route.post('/cancel', cartController.cancel)
route.post("/:itemid", cartController.postItem);
route.post("/remove/:itemid", cartController.deleteItem);
module.exports = route;
