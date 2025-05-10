const User = require('@root/models/userModel')
const jwt = require("jsonwebtoken");

const registerUser = async (req, res, isAdmin) => {
    const { email, password } = req.body;

    //validate inputs
    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).send("Invalid inputs");
    }

    //check if email is already being used
    let user = await User.findOne({ email });

    if (user) {
        return res.status(400).send("Email is in use");
    }

    //create new user and add to mongoDB
    user = new User({ email, password, isAdmin });
    await user.save();

    //create and return a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });

    res.json({ token });
}


module.exports = registerUser