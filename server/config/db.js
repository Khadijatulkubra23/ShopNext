const mongoose = require("mongoose");

let connecting;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  if (!connecting) {
    connecting = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    await connecting;
  } catch (error) {
    connecting = null;
    throw error;
  }
};

module.exports = connectDB;