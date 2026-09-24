const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, default: "🌟" },
    description: { type: String, default: "College student club." },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    adminName: { type: String, default: "Not assigned" },
    memberCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Club", clubSchema);
