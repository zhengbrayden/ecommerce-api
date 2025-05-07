const express = require('express')
const itemController = require('@root/controllers/' +
'adminController/itemController')
const router = express.Router()

//routes
router.post('/', itemController.postItem)
router.delete('/:id', itemController.deleteItem)
router.put('/:id', itemController.updateItem)
module.exports = router