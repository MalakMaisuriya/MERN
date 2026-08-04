const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanagement');
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.log('MongoDB connection error:', err.message);
  }
};

module.exports = connectDB;
