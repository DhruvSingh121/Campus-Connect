require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const clubRoutes = require("./routes/clubs");
const eventRoutes = require("./routes/events");
const requestRoutes = require("./routes/requests");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");

const app = express();

console.log("====================================");
console.log("🚀 Starting CampusConnect Backend");
console.log("====================================");

console.log("PORT:", process.env.PORT || 5000);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

// ===============================
// DATABASE
// ===============================

connectDB()
  .then(() => {
    console.log("✅ Database connection function completed");
  })
  .catch((err) => {
    console.error("❌ DATABASE ERROR:");
    console.error(err);
  });

// ===============================
// CORS
// ===============================

const allowedOrigins = [
  "http://localhost:5173",
  "https://campus-connect-gray-pi.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🌐 Incoming origin:", origin);

      // Thunder Client / Postman / server-to-server requests
      if (!origin) {
        console.log("✅ No origin - allowing request");
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log("✅ CORS allowed:", origin);
        return callback(null, true);
      }

      console.error("❌ CORS BLOCKED:", origin);

      callback(new Error(`CORS blocked origin: ${origin}`));
    },

    credentials: true,
  }),
);

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(morgan("dev"));

// Extra request logger
app.use((req, res, next) => {
  console.log("------------------------------------");
  console.log("➡️ Incoming request");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Origin:", req.headers.origin);
  console.log("------------------------------------");

  next();
});

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
  console.log("❤️ Health check received");

  res.json({
    status: "ok",
    service: "CampusConnect API",
  });
});

// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// ===============================
// 404
// ===============================

app.use((req, res) => {
  console.error("❌ ROUTE NOT FOUND");
  console.error("Method:", req.method);
  console.error("URL:", req.originalUrl);

  res.status(404).json({
    message: "Route not found",
    method: req.method,
    route: req.originalUrl,
  });
});

// ===============================
// ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error("====================================");
  console.error("🔥 SERVER ERROR");
  console.error("====================================");

  console.error("Message:", err.message);
  console.error("Name:", err.name);
  console.error("Route:", req.method, req.originalUrl);
  console.error("Stack:", err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("====================================");
  console.log(`✅ CampusConnect API running on port ${PORT}`);
  console.log("====================================");
});
