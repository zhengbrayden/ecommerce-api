// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require("stripe")(process.env.STRIPE_KEY);
const fulfillCheckout = require("./utils/fullfillCheckout")
const cancelCheckout = require("./utils/cancelCheckout")
const SessionLog = require("./../models/sessionLogModel")
const AsyncSessionLog = require('./../models/asyncSessionLogModel');

const { mongoose } = require("mongoose");

const endpointSecret = process.env.STRIPE_WH_SECRET;

const revertTransaction = async (sessionId) => {
    const session = await mongoose.startSession()

    try {
        await session.withTransaction(async () => {
            const sessionLog = await AsyncSessionLog.findOne({
                sessionId
            }).session(session).populate({
                path: 'transaction',
                populate: {
                    path : 'cart.item'
                }
        })

            if (!sessionLog) {
                return
            }
            //repopulate items
            const cart = sessionLog.transaction.cart

            for (const cartItem of cart) {
                cartItem.item.quantity += cartItem.quantity
                await cartItem.item.save({session})
            }

            //delete transaction
            await sessionLog.transaction.deleteOne({session})
            //delete sessionlog
            await sessionLog.deleteOne({session})

        })
    } catch (err) {
        session.endSession()
        throw err
    }
}

const webhook = async (request, response) => {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (
        event.type === "checkout.session.completed"
    ) {
        fulfillCheckout(event.data.object.id);
    } else if (event.type === "checkout.session.expired") {
        //get sessionLog
        const sessionLog = SessionLog.findOne({
            sessionId: event.data.object.id
        })

        if (sessionLog) {
            await sessionLog.deleteOne()
            cancelCheckout(sessionLog.user)
        }
    } else if (event.type === "checkout.session.async_payment_failed") {
        revertTransaction(event.data.object.id)
    }

    response.status(200).end();
};

const cancel = async (req,res) => {
    const {sessionId } = req.query

    //validate query
    if (typeof sessionId !== "string") {
        return res.status(400).send("Invalid input"); 
    }

    //throws an error if the session has already been expired or has completed
    await stripe.checkout.sessions.expire(
    sessionId
    );
    //find the user
    const sessionLog = await SessionLog.findOne({
        sessionId: sessionId
    })

    if (!sessionLog) {
        return res.status(400).send('Checkout session not found')
        //maybe we should check actual stripe with session id to see if it is a valid sessionId and display success message
    }

    await sessionLog.deleteOne()
    await cancelCheckout(sessionLog.user)
    return res.status(200).send('Checkout cancelled')

}

const success = async (req, res) => {
    const {sessionId } = req.query
    //validate query
    if (typeof sessionId !== "string") {
        return res.status(400).send("Invalid input"); 
    }

    await fulfillCheckout(sessionId)
    //if no error thrown
    res.status(200).send('Checkout successful, view your transaction');
}

module.exports = { webhook , cancel, success};
