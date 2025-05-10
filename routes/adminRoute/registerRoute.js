const express = require('express')
const registerController = require("@root/controllers/adminController" + 
"/registerController")
const router = express.Router()

//routes
router.route('/', registerController.register)

module.exports = router