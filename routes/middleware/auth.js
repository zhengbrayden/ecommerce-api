const jwt = require("jsonwebtoken");

//auth middleware
function auth(req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token after 'Bearer'

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.id; // Attach user ID to request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

module.exports = auth;
