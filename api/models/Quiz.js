const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctOptionIndex: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
});

const quizSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
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
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for searching
quizSchema.index({ 
  title: 'text', 
  description: 'text',
  subject: 'text'
});

module.exports = mongoose.model('Quiz', quizSchema);
