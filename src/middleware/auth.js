const jwt = require("jsonwebtoken");
const User = require("../models/userSchema"); // Ensure the path is correct for your project structure
const JWT_SECRET = "vipul"; // Replace with a more secure secret for production

const authenticateUser = async (req, res, next) => {
  try {
    // Retrieve the token from cookies or Authorization header
    const token =
      req.cookies.token || // From cookies
      req.headers.authorization?.split(" ")[1]; // From headers (Bearer <token>)

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user in the database
    const user = await User.findById(decoded.id).select("-password"); // Exclude password field
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Attach user to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle invalid token or other errors
    console.error("Authentication error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
