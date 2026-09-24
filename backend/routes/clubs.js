const express = require("express");
const Club = require("../models/Club");
const User = require("../models/User");
const Request = require("../models/Request");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/clubs
router.get("/", protect, async (req, res) => {
  const clubs = await Club.find().sort({ createdAt: -1 });
  res.json({ clubs });
});

// @route POST /api/clubs   (superadmin only)
router.post("/", protect, authorize("superadmin"), async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) return res.status(400).json({ message: "Club name is required" });
    const existing = await Club.findOne({ name });
    if (existing) return res.status(400).json({ message: "A club with this name already exists" });
    const club = await Club.create({ name, icon: icon || "🌟", description });
    res.status(201).json({ club });
  } catch (err) {
    res.status(500).json({ message: "Could not create club", error: err.message });
  }
});

// @route PUT /api/clubs/:id/assign-admin   (superadmin only)
router.put("/:id/assign-admin", protect, authorize("superadmin"), async (req, res) => {
  try {
    const { userId } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "clubadmin";
    user.club = club._id;
    await user.save();

    club.admin = user._id;
    club.adminName = user.name;
    await club.save();

    res.json({ club, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Could not assign admin", error: err.message });
  }
});

// @route POST /api/clubs/:id/join   (student requests to join)
router.post("/:id/join", protect, authorize("student"), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    if (req.user.joinedClubs.includes(club._id)) {
      return res.status(400).json({ message: "You are already a member of this club" });
    }
    const existingReq = await Request.findOne({ student: req.user._id, club: club._id, status: "pending" });
    if (existingReq) return res.status(400).json({ message: "You already have a pending request for this club" });

    const request = await Request.create({
      student: req.user._id,
      name: req.user.name,
      email: req.user.email,
      club: club._id,
      clubName: club.name,
    });
    res.status(201).json({ request });
  } catch (err) {
    res.status(500).json({ message: "Could not send join request", error: err.message });
  }
});

// @route POST /api/clubs/:id/leave
router.post("/:id/leave", protect, authorize("student"), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });
    req.user.joinedClubs = req.user.joinedClubs.filter((c) => c.toString() !== club._id.toString());
    await req.user.save();
    club.memberCount = Math.max(0, club.memberCount - 1);
    await club.save();
    res.json({ message: `You left ${club.name}` });
  } catch (err) {
    res.status(500).json({ message: "Could not leave club", error: err.message });
  }
});

module.exports = router;
