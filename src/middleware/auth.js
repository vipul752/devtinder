const jwt = require("jsonwebtoken");
const User = require("../models/userSchema"); // Adjust the path to your User model
const JWT_SECRET = "vipul";

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    const loggedInUser = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(loggedInUser.id).select("-password");
    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticateUser;
