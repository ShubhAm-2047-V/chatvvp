const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Video = require('./models/Video');

dotenv.config();

async function seedTestVideo() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-college-platform';
    await mongoose.connect(uri);
    console.log('--- Seeding Test Video ---');
    
    // Using EXACT subject and topic from the user's note
    const video = await Video.findOneAndUpdate(
      { subject: 'Venom tech', topic: 'Video' },
      { 
        url: 'https://www.youtube.com/watch?v=R96D-mQ407o', 
        title: 'Venom tech - Video Guide',
        teacherId: new mongoose.Types.ObjectId() // Dummy ID
      },
      { upsert: true, new: true }
    );
    console.log('Test Video Seeded:', video);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedTestVideo();
