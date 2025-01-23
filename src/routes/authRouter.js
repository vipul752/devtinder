const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = "vipul";

router.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName || !emailId || !password) {
    return res.status(400).send("Please provide all details");
  }

  const userExists = await User.findOne({ emailId });
  if (userExists) {
    return res.status(400).send("User already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    firstName,
    lastName,
    emailId,
    password: hashedPassword,
  });
  const savedUser = await user.save();

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token, {
    expires: new Date(Date.now() + 8 * 3600000),
  });

  res.json({ messae: "User saved successfully", data: savedUser });
});

router.post("/login", async (req, res) => {
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    return res.status(400).send("Please provide email and password");
  }

  try {
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).send("User not found");
    }

    // Correct usage of bcrypt.compare
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Set the JWT token in cookies
    res.cookie("token", token, {
      secure: false,
    });
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.patch("/resetPassword", async (req, res) => {
  try {
    const { emailId, oldPassword, newPassword } = req.body;
    if (!emailId || !oldPassword || !newPassword) {
      return res.status(400).send("Please provide all details");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).send("User not found");
    }

    const isPasswordMatch = bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).send("Invalid credentials");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.send("Password reset successfully");
  } catch (error) {
    console.log(error);
    res.status(400).send("Error resetting password");
  }
});

router.post("/logout", (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  res.send("Logged out successfully");
});

module.exports = router;
