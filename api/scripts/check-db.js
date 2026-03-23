const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Note = require('./models/Note');
const Video = require('./models/Video');

dotenv.config();

async function checkDb() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-college-platform';
    await mongoose.connect(uri);
    console.log('--- DB Diagnostic ---');
    
    const notes = await Note.find({ topic: /video/i }).limit(5);
    console.log('Notes matching "video":', JSON.stringify(notes.map(n => ({ topic: n.topic, subject: n.subject, youtubeUrl: n.youtubeUrl })), null, 2));
    
    const videos = await Video.find({ topic: /video/i }).limit(5);
    console.log('Videos matching "video":', JSON.stringify(videos.map(v => ({ topic: v.topic, subject: v.subject, url: v.url })), null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Diagnostic error:', err);
    process.exit(1);
  }
}

checkDb();
