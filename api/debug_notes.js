const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-college-platform';

async function checkNotes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./models/User');
    const Note = require('./models/Note');

    const users = await User.find({ role: 'student' });
    console.log(`Found ${users.length} students`);
    users.forEach(u => console.log(`- Student: ${u.email}, Branch: "${u.branch}", Year: ${u.year}`));

    const notes = await Note.find({});
    console.log(`Found ${notes.length} notes`);
    notes.forEach(n => console.log(`- Note: "${n.topic}", Branch: "${n.branch}", Year: ${n.year}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkNotes();
