const registerUser = require('../utils/registerUser')
const register = async (req,res) => {
    await registerUser(req, res, true)
}

module.exports = {register}