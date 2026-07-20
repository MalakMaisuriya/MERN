const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const movieRoutes = require("./routes/movieRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movieDB";

// ------------------ View Engine ------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ------------------ Middleware ------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ------------------ Routes ------------------
app.use("/", movieRoutes);

// ------------------ 404 handler ------------------
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// ------------------ Connect to MongoDB & Start Server ------------------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
