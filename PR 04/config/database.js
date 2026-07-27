const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studentverse";

  mongoose.set("sanitizeFilter", true);

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

module.exports = connectDatabase;
