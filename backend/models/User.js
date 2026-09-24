const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["student", "clubadmin", "superadmin"],
      default: "student",
    },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", default: null }, // only set when role === clubadmin
    joinedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    avatarColor: { type: String, default: "#5b5bd6" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    club: this.club,
    joinedClubs: this.joinedClubs,
    status: this.status,
    avatarColor: this.avatarColor,
  };
};

module.exports = mongoose.model("User", userSchema);
