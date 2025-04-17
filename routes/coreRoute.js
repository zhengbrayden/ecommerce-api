const express = require("express");
const coreController = require("../controllers/coreController");
const route = express.Router();

//middleware
route.use(express.static('public'));
route.use('/register', express.json());
route.use('/login', express.json());

//routes
route.get("/", coreController.frontpage);
route.post("/register", coreController.register);
route.post("/login", coreController.login);
const cartRoute = require('./cartRoute')
const itemRoute = require('./itemRoute')
const stripeRoute = require('./stripeRoute')
const transactionRoute = require('./transactionRoute')
app.use('/cart', cartRoute)
app.use('/items', itemRoute)
app.use('/stripe', stripeRoute)
app.use('/transaction', transactionRoute)


// Error handler for bad JSON
app.use((err, req, res, next) => {
if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.message);
    return res.status(400).json({ error: 'Invalid JSON format in request body' });
}
next(err);
});

module.exports = route;
