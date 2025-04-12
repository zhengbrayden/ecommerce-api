const Item = require('./../models/itemModel')

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

//get items with pagination
const getItems = async (req, res) => {
    //parse the query
    let search = req.query.search //can be none

    if (typeof search !== 'string') {
        search = ''
    }

    const page = Number.parseInt(req.query.page);
    const limit = Number.parseInt(req.query.limit);

    if (Number.NaN(page) || Number.NaN(limit)) {
        return res.status(400)
    }

    const re = new RegExp(`^${escapeRegex(search)}`, 'i')
    let items = await Item.find({ name: re })
        .skip((page - 1) * limit)
        .limit(limit);
    items = items.map((item) => {
        return {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        };
    });
    const total = await Item.countDocuments({ name: re });

    res.json({ data: items, page, limit, total });
};

module.exports = { getItems };
