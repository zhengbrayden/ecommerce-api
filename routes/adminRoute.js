const express = require("express");
const route = express.Router();
const auth = require("./middleware/auth");
const User = require("../models/userModel");
const itemRoute = require("./adminRoute/itemRoute");
const transactionRoute = require("./adminRoute/transactionRoute");

const adminAuth = async (req, res, next) => {
    //check that the user is an admin
    const user = await User.findById(req.id);

    if (!user) {
        return res.status(404).send("User has been deleted/banned");
    }

    if (!user.isAdmin) {
        return res.status(401).send("Unauthorized");
    }
    next();
};

//middleware
route.use(auth);
route.use(adminAuth);
route.use(express.json());
//routes
route.use("/items", itemRoute);
route.use("/transactions", transactionRoute);
module.exports = route;
