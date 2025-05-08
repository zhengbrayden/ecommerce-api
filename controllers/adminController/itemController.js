const Item = require("@root/models/itemModel");

const postItem = async (req, res) => {
    const name = req.body.name;
    const quantity = Number.parseInt(req.body.quantity);
    const price = Number.parseInt(req.body.price);

    //input validation
    if (Number.isNan(quantity)) {
        return res.status(400).send("Invalid input");
    }
    if (quantity < 0) {
        return res.status(400).send("quantity cannot be less than 0");
    }

    if (Number.isNan(price)) {
        return res.status(400).send("Invalid input");
    }
    if (price < 0) {
        return res.status(400).send("price cannot be less than 0");
    }

    if (typeof name !== "string") {
        return res.status(400).send("Invalid input");
    }

    const item = new Item({ name, quantity, price });
    await item.save();
    res.status(201).send(item);
};

const deleteItem = async (req, res) => {
    const id = req.params.id;
    //input validation
    if (typeof id !== "string") {
        return res.sendStatus(400);
    }

    const item = await Item.findByIdAndDelete(id);

    if (!item) {
        res.status(404).send("Item not found");
    } else {
        res.sendStatus(204);
    }
};

const updateItem = async (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    let quantity = req.body.quantity;
    let price = req.body.price;

    //input validation
    if (typeof id !== "string") {
        return res.sendStatus(400);
    }

    if (quantity !== undefined) {
        quantity = Number.parseInt(quantity);

        if (Number.isNan(quantity) || quantity < 0) {
            return res.status(400).send("Invalid input quantity");
        }
    } else {
    }

    if (price !== undefined) {
        price = Number.parseInt(price);

        if (Number.isNan(price) || price < 0) {
            return res.status(400).send("Invalid input price");
        }
    }

    if (name !== undefined && typeof name !== "string") {
        return res.status(400).send("Invalid input");
    }

    const item = Item.findById(id);

    if (!item) {
        return res.status(404).send("Item not found");
    }

    if (quantity !== undefined) {
        item.quantity = quantity;
    }

    if (price !== undefined) {
        item.price = price;
    }

    if (name !== undefined) {
        item.name = name;
    }

    await item.save();
    res.status(201).send(item);
};
module.exports = { postItem, deleteItem, updateItem };
