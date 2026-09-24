const express = require("express");
const Event = require("../models/Event");
const Club = require("../models/Club");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/events   (club admins only see their own club's events)
router.get("/", protect, async (req, res) => {
  const filter = req.user.role === "clubadmin" && req.user.club ? { club: req.user.club } : {};
  const events = await Event.find(filter).sort({ date: 1 });
  res.json({ events });
});

// @route POST /api/events   (clubadmin -> own club only, superadmin -> any club, auto-approved)
router.post("/", protect, authorize("clubadmin", "superadmin"), async (req, res) => {
  try {
    const { name, date, time, venue, description } = req.body;
    if (!name) return res.status(400).json({ message: "Event name is required" });

    let clubId = req.body.clubId;
    if (req.user.role === "clubadmin") clubId = req.user.club;
    if (!clubId) return res.status(400).json({ message: "A club must be selected" });

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    const event = await Event.create({
      name,
      club: club._id,
      clubName: club.name,
      date: date || new Date().toISOString().slice(0, 10),
      time: time || "10:00 AM",
      venue: venue || "College Campus",
      description: description || "New college event.",
      status: req.user.role === "superadmin" ? "Approved" : "Pending",
      createdBy: req.user._id,
    });
    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ message: "Could not create event", error: err.message });
  }
});

// @route PUT /api/events/:id/status   (superadmin approves/rejects)
router.put("/:id/status", protect, authorize("superadmin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: "Could not update event status", error: err.message });
  }
});

// @route POST /api/events/:id/register   (student registers)
router.post("/:id/register", protect, authorize("student"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already registered for this event" });
    }
    event.participants.push(req.user._id);
    await event.save();
    res.json({ event, message: `Registered for ${event.name}` });
  } catch (err) {
    res.status(500).json({ message: "Could not register for event", error: err.message });
  }
});

module.exports = router;
