const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
//register user
const register = async (req, res) => {
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
    const paymentPending = false;
    user = new User({ email, password });
    await user.save();

    //create and return a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });

    res.json({ token });
};

//login user
const login = async (req, res) => {
    //sign in with email and password
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).send();
    }

    //check if this is the correct email and password
    let user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
        return res.status(400).send("Invalid email or password");
    }

    //create and return a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });

    res.json({ token });
};

//home page
const frontpage = async (req, res) => {
    res.status(200).send("<h1>E-Commerce API</h1>");
};

module.exports = { register, login, frontpage };
