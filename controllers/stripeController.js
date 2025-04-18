// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require("stripe")(process.env.STRIPE_KEY);
const mongoose = require("mongoose");
const Transaction = require("../models/transactionModel");
const User = require("./../models/userModel");
// If you are testing your webhook locally with the Stripe CLI you
// can find the endpoint's secret by running `stripe listen`
// Otherwise, find your endpoint's secret in your webhook settings in the Developer Dashboard
const endpointSecret = "whsec_...";
const RETRY_LIMIT = 3;

// This example uses Express to receive webhooks
// Match the raw body to content type application/json
async function fulfillCheckoutHelper(sessionId) {
    // Set your secret key. Remember to switch to your live secret key in production.
    // See your keys here: https://dashboard.stripe.com/apikeys

    console.log("Fulfilling Checkout Session " + sessionId);
    // Retrieve the Checkout Session from the API with line_items expanded
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
    });
    const userid = checkoutSession.client_reference_id;
    //check if session has actually been paid
    if (checkoutSession.payment_status === "unpaid") {
        return;
    }

    //to fulfill an order, all we do for now is create a transaction record
    const dbSession = await mongoose.startSession();
    //error variables
    let alreadyFulfilled = false;
    let retries = 0;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (true) {
        try {
            await dbSession.withTransaction(async () => {
                //check if the order has already been fulfilled
                let transaction = await Transaction.findOne({
                    stripeSessionId: sessionId,
                }).session(dbSession);

                if (transaction) {
                    alreadyFulfilled = true;
                    return;
                }

                //the order. fulfill the order
                let user = await User.findById(userid).session(dbSession);
                transaction = new Transaction({
                    stripeSessionId: sessionId,
                    cart: user.cart,
                    userid: userid,
                });

                //clear the user cart
                user.cart = [];
                user.paymentPending = false;
                user.save({ dbSession });
            });
            break; // transaction succeeded
        } catch (err) {
            //TODO we need to keep trying until it works
            dbSession.endSession();
            const isTransient = err.hasErrorLabel?.(
                "TransientTransactionError",
            );

            if (isTransient && retries < RETRY_LIMIT) {
                console.warn(
                    `TransientTransactionError, retrying transaction (attempt ${retries + 1})...`,
                );
                retries++;
                const backoff = Math.pow(2) * 100; // 200ms → 400ms → 800ms ...
                const jitter = Math.random() * 100;
                await delay(backoff + jitter);
            } else {
                console.error("Transaction error:", err);
                return res.status(400).send(err.message);
            }
        }
    }

    //transaction succeeded
    dbSession.endSession();
}

fulfillCheckout = async (request, response) => {
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
        fulfillCheckoutHelper(event.data.object.id);
    }

    response.status(200).end();
};

module.exports = { fulfillCheckout };
