const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Video = require('./models/Video');

dotenv.config();

async function listVideos() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-college-platform';
    await mongoose.connect(uri);
    console.log('--- All Videos ---');
    
    const videos = await Video.find({}).limit(50);
    console.log(JSON.stringify(videos.map(v => ({ topic: v.topic, subject: v.subject, url: v.url })), null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listVideos();
