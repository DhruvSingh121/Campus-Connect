const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Club = require("../models/Club");
const { protect } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// @route  POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ message: "An account with this email already exists" });

      // role is inferred server-side by convention for the demo, students self-register
      const user = await User.create({ name, email, password, role: "student" });
      const token = signToken(user);
      res.status(201).json({ token, user: user.toSafeObject() });
    } catch (err) {
      res.status(500).json({ message: "Registration failed", error: err.message });
    }
  }
);

// @route  POST /api/auth/login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email } = req.body;
      const { password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
      if (!user) return res.status(401).json({ message: "Invalid email or password" });

      const match = await user.comparePassword(password);
      if (!match) return res.status(401).json({ message: "Invalid email or password" });

      if (user.status === "suspended") {
        return res.status(403).json({ message: "Your account has been suspended" });
      }

      const token = signToken(user);
      res.json({ token, user: user.toSafeObject() });
    } catch (err) {
      res.status(500).json({ message: "Login failed", error: err.message });
    }
  }
);

// @route  GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// @route  PUT /api/auth/me   (update profile)
router.put("/me", protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (name) req.user.name = name;
    if (email) req.user.email = email;
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Could not update profile", error: err.message });
  }
});

module.exports = router;
