const mongoose = require("mongoose");
const User = require("../../models/transactionModel");

const cancelCheckout = async (userid) =>{
        const session = await mongoose.startSession()
        try {
            await session.withTransaction(async () => {
                //restore items, change the status of the user
                const user = await User.FindById(userid).session(session).
                populate('cart.item')

                if (user.paymentPending == false) {
                    return
                }

                user.paymentPending = false
                //for each item in the cart, restore the quantity, save
                for (const cartItem of user.cart) {
                    user.cart.item.quantity += cartItem.quantity
                    await user.cart.item.save({session})
                }
                await user.save({session})
            })
        } catch {
            session.endSession();
            console.error("Transaction error:", err);
            throw err
        }

        session.endSession()
    }

module.exports = cancelCheckout