const Item = require('./../models/itemModel')

//get items with pagination
const getItems = async (req, res) => {
    //parse the query
    let search = req.query.search //can be none

    //validate search
    if (!search) {
        search = ''
    }

    if (typeof search !== 'string') {
        search = ''
    }

    const page = Number.parseInt(req.query.page);
    const limit = Number.parseInt(req.query.limit);
    const re = new RegExp(`^${search}`)
    let items = await Item.find({ name: re })
        .skip((page - 1) * limit)
        .limit(limit);
    items = items.map((item) => {
        return {
            id: item.id,
            name: item.name,
        };
    });
    const total = await Item.countDocuments({ name: re });

    res.json({ data: items, page, limit, total });
};

module.exports = { getItems };
