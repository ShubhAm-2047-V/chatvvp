const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: false
  },
  rawText: {
    type: String,
    default: ''
  },
  cleanedText: {
    type: String,
    default: ''
  },
  formattedText: {
    type: String,
    default: ''
  },
  sections: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  youtubeUrl: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for searching
noteSchema.index({ 
  topic: 'text', 
  cleanedText: 'text', 
  formattedText: 'text' 
});

module.exports = mongoose.model('Note', noteSchema);
