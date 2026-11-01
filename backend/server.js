const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const songRoutes = require("./routes/songRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main route
app.get("/", (req, res) => {
  res.send("Welcome to Frequency API!");
});

// Song routes
app.use("/api/songs", songRoutes);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Frequency API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
