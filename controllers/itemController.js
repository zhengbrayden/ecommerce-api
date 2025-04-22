const Item = require("./../models/itemModel");
const mongoose = require('mongoose')
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//get items with pagination
const getItems = async (req, res) => {
    //parse the query
    let search = req.query.search; //can be none

    if (typeof search !== "string") {
        search = "";
    }

    const page = Number.parseInt(req.query.page);
    const limit = Number.parseInt(req.query.limit);

    if (Number.isNaN(page) || Number.isNaN(limit)) {
        return res.status(400).send("Invalid input");
    }
    const re = new RegExp(`^${escapeRegex(search)}`, "i");
    const session = await mongoose.startSession()
    let items;
    let total;

    try {
        await session.withTransaction(async() => {
            items = await Item.find({ name: re })
            .skip((page - 1) * limit)
            .limit(limit);
            items = items.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                };
            });
            total = await Item.countDocuments({ name: re });
        })
    } catch (err) {
        session.endSession();
        console.error("Transaction error:", err);
        return res.status(400).send(err.message); 
    }

    session.endSession()
    res.json({ data: items, page, limit, total });
};

module.exports = { getItems };
