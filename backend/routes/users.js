const express = require("express");
const User = require("../models/User");
const Club = require("../models/Club");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/users   (superadmin: all students, clubadmin: own club's members)
router.get("/", protect, authorize("clubadmin", "superadmin"), async (req, res) => {
  let filter = {};
  if (req.user.role === "clubadmin" && req.user.club) {
    filter = { joinedClubs: req.user.club };
  } else {
    filter = { role: "student" };
  }
  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
  res.json({ users });
});

// @route PUT /api/users/:id/status   (superadmin suspends/reactivates a student, clubadmin removes from own club)
router.put("/:id/status", protect, authorize("superadmin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Could not update user", error: err.message });
  }
});

// @route DELETE /api/users/:id/clubs/:clubId   (clubadmin removes a member from their club)
router.delete("/:id/clubs/:clubId", protect, authorize("clubadmin", "superadmin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.joinedClubs = user.joinedClubs.filter((c) => c.toString() !== req.params.clubId);
    await user.save();
    await Club.findByIdAndUpdate(req.params.clubId, { $inc: { memberCount: -1 } });
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: "Could not remove member", error: err.message });
  }
});

module.exports = router;
