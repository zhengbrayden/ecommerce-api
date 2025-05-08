const mongoose = require("mongoose");
const Transaction = require("../../models/transactionModel");
const SessionLog = require("./../../models/sessionLogModel");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const AsyncSessionLog = require("./../../models/asyncSessionLogModel");

const RETRY_LIMIT = 3;

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
        throw new Error("Invalid session");
    }

    //check if session has actually been complete
    if (checkoutSession.status !== "complete") {
        throw new Error("Session not paid");
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let retries = 0;
    let session;

    while (true) {
        //to fulfill an order, all we do for now is create a transaction record
        session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                //check if the order has already been fulfilled
                let sessionLog = await SessionLog.findOne({
                    sessionId: sessionId,
                })
                    .session(session)
                    .populate("user");

                if (!sessionLog) {
                    //already been fulfilled
                    console.log("this session has already been fulfilled");
                    return;
                }

                const user = sessionLog.user;

                //the order. fulfill the order
                let total = 0;

                for (const cartItem of user.cart) {
                    total += cartItem.priceAtCheckout * cartItem.quantity;
                }

                const transaction = new Transaction({
                    cart: user.cart,
                    email: user.email,
                    total: total,
                });

                //clear the user cart
                user.cart = [];
                user.paymentPending = false;

                //if async payment
                if (checkoutSession.payment_status === "unpaid") {
                    const asyncSessionLog = new AsyncSessionLog({
                        sessionId,
                        user,
                    });

                    //set transaction to payment pending
                    transaction.paymentPending = true;
                    await asyncSessionLog.save({ session });
                }
                await user.save({ session });
                //delete the sessionLog
                await sessionLog.deleteOne({ session });
                await transaction.save({ session });
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
                throw err;
            }
        }
    }

    //transaction succeeded
    session.endSession();
}

module.exports = fulfillCheckout;
