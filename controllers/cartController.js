const User = require('./../models/userModel')
const Item = require('./../models/itemModel')
const mongoose = require('mongoose')
const stripe = require('stripe')(process.env.STRIPE_KEY)

const getCart = async (req, res) => {
    //get all items in the cart and send the info to the user
    cart = await User.findById(req.id).cart
    //in the cart we store item ids but we actually need the name to give the user
    const itemIds = cart.map(cartItem => cartItem.itemid)
    const items = await Item.find({ _id: { $in: itemIds } })
    const itemMap = new Map();

    for (item of items) {
        itemMap.set(item.id, item)
    }

    data = cart.map(cartItem => {
        item = itemMap.get(cartItem.itemid)
        if (item) { //in case item is deleted in between database reads
            return {
                name: item.name,
                quantity: cartItem.quantity,
                price: item.price
            }
        }
    })

    res.json({data : data})
}

const postItem = async(req,res) => {
    //function for adding an item to a users cart. Require the id and the amount
    const { itemid } = req.params
    //input validation
    if (typeof itemid !== "string") {
        return res.status(400).send('Invalid input')
    }

    const quantity  = Number.parseInt(req.body.quantity)

    if (Number.isNaN(quantity)) {
        return res.status(400).send('Invalid input')
    }
    //

    //quantity must be a positive integer
    if (quantity <= 0) {
        return res.status(400).send('Invalid input')
    }

    //need a transaction to avoid no-update
    const session = await mongoose.startSession()
    let cartItem = {}

    try {
        await session.withTransaction(async () =>{
            const user = await User.findById(req.id).session(session)

            //check if payment is pending on cart
            if (user.paymentPending) {
                throw new Error("Payment pending; cannot modify cart")
            }

            //want to map cart items by id of item
            const itemMap = new Map()
            
            for (cartItem of user.cart) {
                itemMap.set(cartItem.itemid.toString(), cartItem)
            }

            //check if itemid is already in cart
            if (itemMap.has(itemid)) {
                cartItem = itemMap.get(itemid)
                cartItem.quantity += quantity
            } else {
                cartItem = {
                    itemid: itemid,
                    quantity: quantity
                }
                user.cart.push(cartItem)
            }

            const item = await Item.findById(itemid).session(session)
            
            //check if item exists
            if (!item) {
                throw new Error("Item not found");
            }

            //check if the quantity in the cart exceeds the stock
            if (cartItem.quantity > item.quantity) {
                throw new Error("Not enough stock");
            }
            await user.save({session})
        })

    res.status(201).json(cartItem);
    } catch (err) {
        console.error('Transaction error:', err);
        let status = 400
        if (err.message === 'Item not found' || err.message === 'Not enough stock') {
            status = 404
        }
        res.status(status).send(err.message)
    } finally {
        session.endSession()
    }
}

const deleteItem = async (req,res) =>{
    //id, the amount
    const { itemid } = req.params
    
    //input validation
    if (typeof itemid !== "string") {
        return res.status(400).send('Invalid input')
    }

    const quantity  = Number.parseInt(req.body.quantity)

    if (Number.isNaN(quantity)) {
        return res.status(400).send('Invalid input')
    }
    //

    //quantity must be a positive integer
    if (quantity <= 0) {
        return res.status(400).send('Invalid input')
    } 

    const session = await mongoose.startSession()

    try {
        await session.withTransaction(async () =>{
            const user = await User.findById(req.id).session(session)

            //check if payment is pending on cart
            if (user.paymentPending) {
                throw new Error("Payment pending; cannot modify cart")
            }

            //want to map cart items by id of item
            const itemMap = new Map()
            
            for (cartItem of user.cart) {
                itemMap.set(cartItem.itemid.toString(), cartItem)
            }

            //check if itemid is in cart
            if (!itemMap.has(itemid)) {
                throw new Error('Item not found')
            }

            const cartItem = itemMap.get(itemid)
            cartItem.quantity -= quantity

            //check if the quantity in the cart is 0 or less
            if (cartItem.quantity <= 0) {
                //remove cartItem
                user.cart.splice(user.cart.indexOf(cartItem), 1)

            }

            await user.save({session})
        })

    res.sendStatus(204)
    } catch (err) {
        let status = 400
        if (err.message === 'Item not found') {
            status = 404
        }
        console.error('Transaction error:', err);
        res.status(status).send(err.message)
    } finally {
        session.endSession()
    }
}

const checkout = async (req, res) => {
    //first, perform a database transaction
    const dbSession = await mongoose.startSession()

    try {
        await session.withTransaction(async () => {
            const user = await User.findById(req.id).session(session)
            const cart = user.cart
            const itemIds = cart.map((cartItem) => cartItem.itemid)
            const items = await User.find({_id: { $in : itemIds }})
            const itemMap = new Map()

            for (item of items) {
                itemMap.set(item.id, item)
            }

            let invalidItems = new Set()
        
            for (cartItem of cart) {
                const item = itemMap[cartItem.itemid]

                //item may have been deleted, invalid cart
                if (!item) {
                    invalidItems.add(cartItem.itemid)
                    continue
                }

                item.quantity -= cartItem.quantity //should the item get removed if there is no more stock?

                if (item.quantity < 0) {
                    //cannot proceed with this checkout, must remove this item from the cart
                    invalidItems.add(cartItem.itemid)
                }
            }

            //cart is invalid
            if (invalidItems.size > 0) {
                //construct new cart
                user.cart = []

                for (cartItem of cart) {
                    if (!invalidItems.has(cartItem.itemid)) {
                        user.cart.push(cartItem)
                    }
                }

                await user.save({session})
                //alert the user that there is not enough stock for these items
                throw new Error('Not enough stock for 1 or more items')
            }

            //if cart is valid, save it
            for (item of items) {
                await item.save({Session})
            }
        })

        dbSession.endSession()

        //send stripe session
        //build checkout box
        const line_items = cartItems.map((cartItem) => {
            const item = itemMap.get(cartItem.itemid)
            const product_data = {
                name: item.name
            }
            const price_data = {
                currency: 'cad',
                product_data: product_data,
                unit_amount: item.price
            }

            return {
                price_data: price_data,
                quantity: cartItem.quantity
            }
        })

        const port = process.env.PORT || 5000;

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url : `localhost:${port}/success.html`,
            cancel_url: `localhost:${port}/cancel.html`
        })

        res.redirect(303, session.url)
    } catch (err) {
        let status = 400
        if (err.message === 'Not enough stock for 1 or more items') {
            status = 404
        }
        res.status(status).send(err.message)
        dbSession.endSession() //possibility that this happens twice? could be bad
    }
}

module.exports = {getCart, postItem, deleteItem, checkout}