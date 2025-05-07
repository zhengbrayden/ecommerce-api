const mongoose = require('mongoose')
const AsyncSessionLog = require('@root/models/asyncSessionLogModel')

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
                const item = cartItem.item
                if (!item) {
                    //the item was deleted so forget about it
                    continue
                }
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

    session.endSession()
}

module.exports = revertTransaction
