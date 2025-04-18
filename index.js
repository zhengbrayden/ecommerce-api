require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const main = async () => {
    const app = express();

    //router mounting
    const coreRoute = require("./routes/coreRoute"); //route for root
    app.use("/", coreRoute);

    await mongoose.connect(process.env.MONGO_URI);

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server has started on port ${port}`));
};

main();
