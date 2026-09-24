const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Club = require("../models/Club");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ========================================
// JWT TOKEN
// ========================================

function signToken(user) {
  console.log("🎫 Creating JWT token...");
  console.log("User ID:", user._id);
  console.log("User role:", user.role);
  console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
}

// ========================================
// REGISTER
// ========================================

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),

    body("email").isEmail().withMessage("A valid email is required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],

  async (req, res) => {
    console.log("========================================");
    console.log("📝 REGISTER REQUEST RECEIVED");
    console.log("========================================");

    console.log("Name:", req.body.name);
    console.log("Email:", req.body.email);
    console.log("Password received:", !!req.body.password);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.error("❌ REGISTER VALIDATION ERROR");
      console.error(errors.array());

      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const { name, email, password } = req.body;

      console.log("🔎 Checking if user already exists...");

      const existing = await User.findOne({
        email: email.toLowerCase(),
      });

      if (existing) {
        console.error("❌ User already exists:", email);

        return res.status(400).json({
          message: "An account with this email already exists",
        });
      }

      console.log("✅ User does not exist");
      console.log("👤 Creating new user...");

      const user = await User.create({
        name,
        email,
        password,
        role: "student",
      });

      console.log("✅ User created successfully");
      console.log("User ID:", user._id);
      console.log("User email:", user.email);

      const token = signToken(user);

      console.log("✅ Registration successful");

      res.status(201).json({
        token,
        user: user.toSafeObject(),
      });
    } catch (err) {
      console.error("========================================");
      console.error("🔥 REGISTRATION ERROR");
      console.error("========================================");

      console.error("Message:", err.message);
      console.error("Name:", err.name);
      console.error("Stack:", err.stack);

      res.status(500).json({
        message: "Registration failed",
        error: err.message,
      });
    }
  },
);

// ========================================
// LOGIN
// ========================================

router.post(
  "/login",

  [
    body("email").isEmail().withMessage("Valid email is required"),

    body("password").notEmpty().withMessage("Password is required"),
  ],

  async (req, res) => {
    console.log("========================================");
    console.log("🔐 LOGIN REQUEST RECEIVED");
    console.log("========================================");

    console.log("Email:", req.body.email);
    console.log("Password received:", !!req.body.password);

    // -----------------------------
    // VALIDATION
    // -----------------------------

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.error("❌ LOGIN VALIDATION ERROR");
      console.error(errors.array());

      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const { email, password } = req.body;

      console.log("📧 Login email:", email.toLowerCase());

      // -----------------------------
      // FIND USER
      // -----------------------------

      console.log("🔎 Searching user in MongoDB...");

      const user = await User.findOne({
        email: email.toLowerCase(),
      }).select("+password");

      if (!user) {
        console.error("❌ USER NOT FOUND");
        console.error("Email searched:", email.toLowerCase());

        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      console.log("✅ USER FOUND");
      console.log("User ID:", user._id);
      console.log("User email:", user.email);
      console.log("User role:", user.role);
      console.log("User status:", user.status);

      // -----------------------------
      // PASSWORD
      // -----------------------------

      console.log("🔑 Checking password...");

      const match = await user.comparePassword(password);

      console.log("Password match:", match);

      if (!match) {
        console.error("❌ PASSWORD DOES NOT MATCH");

        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      console.log("✅ PASSWORD CORRECT");

      // -----------------------------
      // ACCOUNT STATUS
      // -----------------------------

      if (user.status === "suspended") {
        console.error("❌ ACCOUNT SUSPENDED");

        return res.status(403).json({
          message: "Your account has been suspended",
        });
      }

      console.log("✅ ACCOUNT STATUS OK");

      // -----------------------------
      // JWT
      // -----------------------------

      const token = signToken(user);

      console.log("✅ JWT CREATED");
      console.log("✅ LOGIN SUCCESSFUL");
      console.log("========================================");

      res.json({
        token,
        user: user.toSafeObject(),
      });
    } catch (err) {
      console.error("========================================");
      console.error("🔥 LOGIN ERROR");
      console.error("========================================");

      console.error("Message:", err.message);
      console.error("Name:", err.name);
      console.error("Stack:", err.stack);

      res.status(500).json({
        message: "Login failed",
        error: err.message,
      });
    }
  },
);

// ========================================
// GET CURRENT USER
// ========================================

router.get("/me", protect, async (req, res) => {
  console.log("👤 GET /api/auth/me");

  try {
    console.log("User ID:", req.user?._id);

    res.json({
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    console.error("❌ GET CURRENT USER ERROR");
    console.error(err);

    res.status(500).json({
      message: "Could not get user",
      error: err.message,
    });
  }
});

// ========================================
// UPDATE PROFILE
// ========================================

router.put("/me", protect, async (req, res) => {
  console.log("✏️ UPDATE PROFILE REQUEST");

  try {
    console.log("User ID:", req.user?._id);
    console.log("New name:", req.body.name);
    console.log("New email:", req.body.email);

    const { name, email } = req.body;

    if (name) {
      req.user.name = name;
    }

    if (email) {
      req.user.email = email;
    }

    await req.user.save();

    console.log("✅ Profile updated successfully");

    res.json({
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    console.error("========================================");
    console.error("🔥 PROFILE UPDATE ERROR");
    console.error("========================================");

    console.error("Message:", err.message);
    console.error("Name:", err.name);
    console.error("Stack:", err.stack);

    res.status(500).json({
      message: "Could not update profile",
      error: err.message,
    });
  }
});

module.exports = router;
