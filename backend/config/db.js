const mongoose = require("mongoose");

async function connectDB() {
  try {
    console.log("🔄 Starting MongoDB connection...");
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

    const uri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusconnect";

    await mongoose.connect(uri);

    console.log("✅ MongoDB connected successfully!");
    console.log("🌐 MongoDB host:", mongoose.connection.host);
    console.log("📦 Database:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB CONNECTION ERROR");
    console.error("Message:", err.message);
    console.error("Name:", err.name);
    console.error("Stack:", err.stack);

    process.exit(1);
  }
}

module.exports = connectDB;
