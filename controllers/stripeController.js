// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require("stripe")(process.env.STRIPE_KEY);
const fulfillCheckout = require("./utils/fullfillCheckout")
const cancelCheckout = require("./utils/cancelCheckout")
const SessionLog = require("./../models/sessionLogModel")

const endpointSecret = process.env.STRIPE_WH_SECRET;

webhook = async (request, response) => {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (
        event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded"
    ) {
        fulfillCheckout(event.data.object.id);
    } else if (event.type === "checkout.session.expired" ||
               event.type === 'checkout.session.async_payment_failed') {
        //get sessionLog
        const sessionLog = SessionLog.findOne({
            sessionId: event.data.object.id
        })

        if (sessionLog) {
            await sessionLog.deleteOne()
            cancelCheckout(sessionLog.user)
        }
    }

    response.status(200).end();
};

module.exports = { webhook };
