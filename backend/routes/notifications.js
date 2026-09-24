const express = require("express");
const Notification = require("../models/Notification");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/notifications  (scoped to the user's role/club + "All Students")
router.get("/", protect, async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
  res.json({ notifications });
});

// @route POST /api/notifications  (clubadmin, superadmin)
router.post("/", protect, authorize("clubadmin", "superadmin"), async (req, res) => {
  try {
    const { title, message, scope } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    const notification = await Notification.create({
      title,
      message: message || "New announcement.",
      scope: scope || "All Students",
      createdBy: req.user._id,
    });
    res.status(201).json({ notification });
  } catch (err) {
    res.status(500).json({ message: "Could not create notification", error: err.message });
  }
});

// @route PUT /api/notifications/:id/read
router.put("/:id/read", protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Could not update notification", error: err.message });
  }
});

module.exports = router;
