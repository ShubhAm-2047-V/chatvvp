const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-college-platform';

async function verifyFilter() {
  try {
    await mongoose.connect(MONGODB_URI);
    const Note = require('./models/Note');

    const branch = 'CSE';
    const year = 4;

    const query = { 
      $or: [
        { branch: { $regex: new RegExp(`^${branch}$`, 'i') }, year: Number(year) },
        { branch: { $regex: /^(All|General)$/i } }
      ]
    };

    const notes = await Note.find(query);
    console.log(`With Branch: ${branch}, Year: ${year}, found ${notes.length} notes`);
    
    // Test with a General note
    const generalNote = await Note.findOne({ branch: /^(All|General)$/i });
    if (generalNote) {
        console.log(`Found a General note: ${generalNote.topic}`);
    } else {
        console.log('No General/All notes found in DB yet.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verifyFilter();
