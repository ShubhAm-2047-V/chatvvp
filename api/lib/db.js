const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  isConnected = true;
  console.log('MongoDB connected');
};

module.exports = { connectDB };
