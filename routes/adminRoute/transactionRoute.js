const express = require('express')
const transactionController = require(global.__dirname +
'/controllers/adminController/itemController')
const router = express.Router()

//routes
router.post('/', itemController.postItem)
router.delete('/:id', itemController.deleteItem)
router.put('/:id', itemController.updateItem)
module.exports = router