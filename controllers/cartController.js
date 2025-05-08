const User = require("./../models/userModel");
const Item = require("./../models/itemModel");
const SessionLog = require("./../models/sessionLogModel");

const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const cancelCheckout = require("./utils/cancelCheckout");

const getCart = async (req, res) => {
    //get all items in the cart and send the info to the user
    const user = await User.findById(req.id);
    const cart = user.cart;
    //in the cart we store item ids but we actually need the name to give the user
    const itemIds = cart.map((cartItem) => cartItem.item);
    const items = await Item.find({ _id: { $in: itemIds } });
    const itemMap = new Map();
    let total = 0;

    if (user.paymentPending) {
        for (const cartItem of cart) {
            total += cartItem.priceAtCheckout;
        }
    } else {
        for (const item of items) {
            itemMap.set(item.id, item);
            total += item.price;
        }
    }

    const data = cart.map((cartItem) => {
        const item = itemMap.get(cartItem.item.toString());
        if (item) {
            //in case item has been deleted
            return {
                name: item.name,
                quantity: cartItem.quantity,
                price: item.price,
            };
        }
    });

    res.json({ data, total });
};

const postItem = async (req, res) => {
    //function for adding an item to a users cart. Require the id and the amount
    const { itemid } = req.params;
    //input validation
    if (typeof itemid !== "string") {
        return res.status(400).send("Invalid input");
    }

    //req.body could be null
    if (!req.body) {
        return res.status(400).send("Invalid input");
    }

    const quantity = Number.parseInt(req.body.quantity);

    if (Number.isNaN(quantity)) {
        return res.status(400).send("Invalid input");
    }
    //

    //quantity must be a positive integer
    if (quantity <= 0) {
        return res.status(400).send("Invalid input");
    }

    //need a transaction to avoid no-update
    const session = await mongoose.startSession();
    let cartItem = {};
    //error variables
    let paymentPending = false;
    let notEnoughStock = false;
    let notFound = false;
    let userNotFound = false;

    try {
        await session.withTransaction(async () => {
            const user = await User.findById(req.id).session(session);
            //check if user is still with us
            if (!user) {
                userNotFound = true;
                return;
            }
            //check if payment is pending on cart
            if (user.paymentPending) {
                paymentPending = true;
                return;
            }

            //want to map cart items by id of item
            const itemMap = new Map();

            for (const cartItem of user.cart) {
                itemMap.set(cartItem.item.toString(), cartItem);
            }

            //check if itemid is already in cart
            if (itemMap.has(itemid)) {
                cartItem = itemMap.get(itemid);
                cartItem.quantity += quantity;
            } else {
                cartItem = {
                    item: itemid,
                    quantity: quantity,
                };
                user.cart.push(cartItem);
            }

            const item = await Item.findById(itemid).session(session);

            //check if item exists
            if (!item) {
                notFound = true;
                return;
            }

            //check if the quantity in the cart exceeds the stock
            if (cartItem.quantity > item.quantity) {
                notEnoughStock = true;
                return;
            }
            await user.save({ session });
        });
    } catch (err) {
        console.error("Transaction error:", err);
        session.endSession();
        return res.status(400).send(err.message);
    }

    session.endSession();

    //check for errors
    if (notFound) {
        return res.status(404).send("Item not found");
    } else if (paymentPending) {
        return res
            .status(400)
            .send("This cart cannot be modified when payment pending");
    } else if (notEnoughStock) {
        return res.status(404).send("Not enough stock");
    } else if (userNotFound) {
        return res.status(404).send("User has been deleted/banned");
    }

    res.status(201).json(cartItem);
};

const deleteItem = async (req, res) => {
    //id, the amount
    const { itemid } = req.params;

    //input validation
    if (typeof itemid !== "string") {
        return res.status(400).send("Invalid input");
    }

    //req.body could be null
    if (!req.body) {
        return res.status(400).send("Invalid input");
    }

    const quantity = Number.parseInt(req.body.quantity);

    if (Number.isNaN(quantity)) {
        return res.status(400).send("Invalid input");
    }
    //

    //quantity must be a positive integer
    if (quantity <= 0) {
        return res.status(400).send("Invalid input");
    }

    const session = await mongoose.startSession();
    //error variables
    let paymentPending = false;
    let notFound = false;
    let userNotFound = false;

    try {
        await session.withTransaction(async () => {
            const user = await User.findById(req.id).session(session);

            if (!user) {
                userNotFound = true;
                return;
            }
            //check if payment is pending on cart
            if (user.paymentPending) {
                paymentPending = true;
                return;
            }

            //want to map cart items by id of item
            const itemMap = new Map();

            for (const cartItem of user.cart) {
                itemMap.set(cartItem.item.toString(), cartItem);
            }

            //check if itemid is in cart
            if (!itemMap.has(itemid)) {
                notFound = true;
                return;
            }

            const cartItem = itemMap.get(itemid);
            cartItem.quantity -= quantity;

            //check if the quantity in the cart is 0 or less
            if (cartItem.quantity <= 0) {
                //remove cartItem
                user.cart.splice(user.cart.indexOf(cartItem), 1);
            }

            await user.save({ session });
        });
    } catch (err) {
        session.endSession();
        console.error("Transaction error:", err);
        return res.status(400).send(err.message);
    }

    session.endSession();

    //check for errors
    if (notFound) {
        return res.status(404).send("Item not found");
    } else if (paymentPending) {
        return res
            .status(400)
            .send("This cart cannot be modified when payment pending");
    } else if (userNotFound) {
        return res.status(404).send("User has been deleted/banned");
    }

    //success
    res.sendStatus(204);
};

const checkout = async (req, res) => {
    //first, perform a database transaction
    let session = await mongoose.startSession();
    let cart;
    const itemMap = new Map();
    //error variables
    let emptyCart = false;
    let invalidCart = false;
    let paymentPending = false;
    let userNotFound = false;

    try {
        await session.withTransaction(async () => {
            const user = await User.findById(req.id).session(session);
            if (!user) {
                userNotFound = true;
                return;
            }
            cart = user.cart;
            //cant checkout with empty cart
            if (cart.length === 0) {
                emptyCart = true;
                return;
            }

            if (user.paymentPending) {
                paymentPending = true;
                return;
            }

            //get all items in cart
            const itemIds = cart.map((cartItem) => cartItem.item);

            const items = await Item.find({ _id: { $in: itemIds } });

            //map items by id

            for (const item of items) {
                itemMap.set(item.id, item);
            }
            let invalidItems = new Set();

            for (const cartItem of cart) {
                const item = itemMap.get(cartItem.item.toString());

                //item may have been deleted, invalid cart
                if (!item) {
                    invalidItems.add(cartItem.item.toString());
                    continue;
                }

                item.quantity -= cartItem.quantity;
                //set the price at checkout
                cartItem.priceAtCheckout = item.price;

                if (item.quantity < 0) {
                    //cannot proceed with this checkout, must remove this item from the cart
                    invalidItems.add(cartItem.item.toString());
                }
            }

            //cart is invalid
            if (invalidItems.size > 0) {
                //construct new cart
                user.cart = [];

                for (cartItem of cart) {
                    if (!invalidItems.has(cartItem.item.toString())) {
                        user.cart.push(cartItem);
                    }
                }

                await user.save({ session });
                //alert the user that there is not enough stock for these items
                invalidCart = true;
                return;
            }

            //if cart is valid, save it
            for (const item of items) {
                await item.save({ session });
            }

            await cart.save({ session });

            //set user status to payment pending
            user.paymentPending = true;
            await user.save({ session });
        });
    } catch (err) {
        //we really just want this to catch transaction errors not all of them
        session.endSession();
        console.error("Transaction error:", err);
        return res.status(400).send(err.message);
    }

    //no errors try block has successfully completed
    session.endSession();

    //check if checkout was unable to complete
    if (emptyCart) {
        res.status(400).send("Cart is empty");
        return;
    } else if (invalidCart) {
        res.status(404).send("Not enough stock for 1 or more items");
        return;
    } else if (paymentPending) {
        res.status(400).send("already checking out");
    } else if (userNotFound) {
        res.status(404).send("User has been deleted or banned");
    }

    //send stripe session
    //build checkout box
    const line_items = cart.map((cartItem) => {
        const item = itemMap.get(cartItem.item.toString());
        const product_data = {
            name: item.name,
        };
        const price_data = {
            currency: "cad",
            product_data: product_data,
            unit_amount: cartItem.priceAtCheckout,
        };

        return {
            price_data: price_data,
            quantity: cartItem.quantity,
        };
    });

    const baseUrl = `${req.protocol}://${req.headers.host}`;

    session = await stripe.checkout.sessions.create({
        client_reference_id: req.id,
        line_items: line_items,
        mode: "payment",
        success_url:
            `${baseUrl}/stripe/success?sessionId=` + `{CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/stripe/cancel?sessionId={CHECKOUT_SESSION_ID}`,
    });

    //should store the session id in our database for easy access
    const sessionLog = new SessionLog({ user: req.id, sessionId: session.id });
    await sessionLog.save();
    res.json({ url: session.url });
};

const cancel = async (req, res) => {
    //get the sessionlog based on user
    const sessionLog = await SessionLog.findOne({
        user: req.id,
    });

    if (!sessionLog) {
        //no sessionlog but checkout status might still be active due to network issues
        const user = await User.findById(req.id);

        if (!user) {
            return res.status(404).send("user not found");
        }

        if (user.paymentPending == false) {
            return res.status(400).send("No checkout to cancel");
        }

        //there is an ongoing checkout
        await cancelCheckout(req.id);
        return res.status(200).send("Checkout cancelled");
    }

    //throws an error if the session has already been expired or has completed or if it simply doesnt work
    await stripe.checkout.sessions.expire(sessionLog.sessionId);

    //delete sessionlog
    await sessionLog.deleteOne();
    await cancelCheckout(req.id);
    return res.status(200).send("Checkout cancelled");
};

module.exports = { getCart, postItem, deleteItem, checkout, cancel };
