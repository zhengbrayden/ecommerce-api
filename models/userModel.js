const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//define cart sub-schema
const cartItemSchema = new mongoose.Schema({
    itemid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

}, {_id: false})

//define user model schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cart: [cartItemSchema],
    paymentPending: {
        type: Boolean,
        required: true,
        default: false
    }
});

//hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
