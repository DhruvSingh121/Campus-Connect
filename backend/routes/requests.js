const express = require("express");
const Request = require("../models/Request");
const Club = require("../models/Club");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/requests   (clubadmin: scoped to own club, superadmin: all)
router.get("/", protect, authorize("clubadmin", "superadmin"), async (req, res) => {
  const filter = { status: "pending" };
  if (req.user.role === "clubadmin" && req.user.club) filter.club = req.user.club;
  const requests = await Request.find(filter).sort({ createdAt: -1 });
  res.json({ requests });
});

// @route PUT /api/requests/:id/approve
router.put("/:id/approve", protect, authorize("clubadmin", "superadmin"), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (req.user.role === "clubadmin" && request.club.toString() !== req.user.club?.toString()) {
      return res.status(403).json({ message: "You can only manage your own club's requests" });
    }
    request.status = "approved";
    await request.save();

    await User.findByIdAndUpdate(request.student, { $addToSet: { joinedClubs: request.club } });
    await Club.findByIdAndUpdate(request.club, { $inc: { memberCount: 1 } });

    res.json({ message: `${request.name} approved for ${request.clubName}` });
  } catch (err) {
    res.status(500).json({ message: "Could not approve request", error: err.message });
  }
});

// @route PUT /api/requests/:id/reject
router.put("/:id/reject", protect, authorize("clubadmin", "superadmin"), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (req.user.role === "clubadmin" && request.club.toString() !== req.user.club?.toString()) {
      return res.status(403).json({ message: "You can only manage your own club's requests" });
    }
    request.status = "rejected";
    await request.save();
    res.json({ message: `${request.name} rejected` });
  } catch (err) {
    res.status(500).json({ message: "Could not reject request", error: err.message });
  }
});

module.exports = router;
