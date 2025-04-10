const User = require('./../models/userModel')
const Item = require('./../models/itemModel')

const getCart = async (req, res) => {
    //get all items in the cart and send the info to the user
    cart = await User.findById(req.id).cart
    //in the cart we store item ids but we actually need the name to give the user
    const itemIds = cart.map(cartItem => cartItem.itemid)
    const items = await Item.find({ _id: { $in: itemIds } })
    const itemMap = new Map();

    for (item of items) {
        itemMap.set(item._id.toString(), item)
    }

    data = cart.map(cartItem => {
        item = itemMap.get(cartItem.itemid) //TODO could pose an issue if the item is deleted in between database reads
        return {
            name: item.name,
            quantity: cartItem.quantity,
            price: item.price
        }

    })

    res.json({data : data})
}

const postItem = async(req,res) => {

}

const deleteItem = async (req,res) =>{

}
const checkout = async (req, res) => {

}

module.exports = {getCart, postItem, deleteItem, checkout}