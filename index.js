require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")

app.use(express.json());

//add core routes
const coreRoute = require("./routes/coreRoute")
app.use("/", coreRoute)
//add item routes
const itemRoute = require("./routes/itemRoute")
app.use("/items", itemRoute)

//create item
app.post("/todos", async (req, res) => {
  const { title, description } = req.body;
  //create new Item
  const item = new Item({ title, description, userid: req.id });
  await item.save();
  res.status(201).json({ title: title, description: description, id: req.id });
});

//update item
app.put("/todos/:id", async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;
  const item = await Item.findById(id);
  //check if the item exists
  if (!item) {
    return res.status(404).send("Item not found");
  }

  //check if proper user
  if (item.userid != req.id) {
    return res.status(403).send("Forbidden");
  }

  //update the item
  item.description = description;
  item.title = title;
  await item.save();
  res.status(201).json({ title: title, description: description, id: id });
});

//delete item
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  //delete item if it belongs to user
  result = await Item.deleteOne({ _id: id, userid: req.id });
  if (result.deletedCount === 0) {
    return res.status(403).send("Forbidden");
  }

  res.sendStatus(204);
});

//get items with pagination
app.get("/todos", async (req, res) => {
  const page = Number.parseInt(req.query.page);
  const limit = Number.parseInt(req.query.limit);
  let items = await Item.find({ userid: req.id })
    .skip((page - 1) * limit)
    .limit(limit);
  items = items.map((item) => {
    return { id: item.id, description: item.description, title: item.title };
  });
  const total = await Item.countDocuments({ userid: req.id });

  res.json({ data: items, page, limit, total });
});

app.listen(port, () => console.log(`Server has started on port ${port}`));

//connect to database
mongoose.connect(process.env.MONGO_URI);
const port = process.env.PORT || 5000;

//middleware
function auth(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
}
//require authorizaton for adding to cart??
//app.use("/", auth);