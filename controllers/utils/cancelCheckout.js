const mongoose = require("mongoose");
const User = require("../../models/userModel");

const cancelCheckout = async (userid) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            //restore items, change the status of the user
            const user = await User.findById(userid)
                .session(session)
                .populate("cart.item");

            if (user.paymentPending == false) {
                return;
            }

            user.paymentPending = false;
            //for each item in the cart, restore the quantity, save
            for (const cartItem of user.cart) {
                if (!cartItem.item) {
                    continue;
                }
                cartItem.item.quantity += cartItem.quantity;
                await cartItem.item.save({ session });
            }
            await user.save({ session });
        });
    } catch (err) {
        session.endSession();
        console.error("Transaction error:", err);
        throw err;
    }

    session.endSession();
};

module.exports = cancelCheckout;
