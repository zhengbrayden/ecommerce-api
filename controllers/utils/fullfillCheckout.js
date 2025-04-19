const mongoose = require("mongoose");
const Transaction = require("../../models/transactionModel");
const User = require("./../../models/userModel");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const RETRY_LIMIT = 3

async function fulfillCheckout(sessionId) {
    // Set your secret key. Remember to switch to your live secret key in production.
    // See your keys here: https://dashboard.stripe.com/apikeys

    console.log("Fulfilling Checkout Session " + sessionId);
    // Retrieve the Checkout Session from the API with line_items expanded
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
    });

    //invalid session id
    if (!checkoutSession) {
        return
    }

    const userid = checkoutSession.client_reference_id;
    //check if session has actually been paid
    if (checkoutSession.payment_status === "unpaid") {
        return;
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let retries = 0;
    let session;

    while (true) {

        //to fulfill an order, all we do for now is create a transaction record
        session = await mongoose.startSession();
        //error variables
        let alreadyFulfilled = false;
        try {
            await session.withTransaction(async () => {
                //check if the order has already been fulfilled
                let transaction = await Transaction.findOne({
                    stripeSessionId: sessionId,
                }).session(session);

                if (transaction) {
                    alreadyFulfilled = true;
                    return;
                }

                //the order. fulfill the order
                let user = await User.findById(userid).session(session);
                transaction = new Transaction({
                    stripeSessionId: sessionId,
                    cart: user.cart,
                    userid: userid,
                });

                //clear the user cart
                user.cart = [];
                user.paymentPending = false;
                await user.save({ session });
                await transaction.save({session})
            });
            break; // transaction succeeded
        } catch (err) {
            //TODO we need to keep trying until it works
            session.endSession();
            const isTransient = err.hasErrorLabel?.(
                "TransientTransactionError",
            );

            if (isTransient && retries < RETRY_LIMIT) {
                console.warn(
                    `TransientTransactionError, retrying transaction (attempt ${retries + 1})...`,
                );
                retries++;
                const backoff = Math.pow(2, retries) * 100; // 200ms → 400ms → 800ms ...
                const jitter = Math.random() * 100;
                await delay(backoff + jitter);
            } else {
                console.error("Transaction error:", err);
                return
            }
        }
    }

    //transaction succeeded
    session.endSession();
}

module.exports = fulfillCheckout