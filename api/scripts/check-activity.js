const mongoose = require('mongoose');
const Activity = require('./models/Activity');
require('dotenv').config();

async function checkActivity() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college-study-platform');
    const count = await Activity.countDocuments();
    const latest = await Activity.find().sort({ createdAt: -1 }).limit(5);
    console.log(`Total activities: ${count}`);
    console.log('Latest activities:', JSON.stringify(latest, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkActivity();
