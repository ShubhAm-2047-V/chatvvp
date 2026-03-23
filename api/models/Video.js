const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String
  }
}, {
  timestamps: true
});

// Text index for better topic searching
videoSchema.index({ subject: 'text', topic: 'text' });

module.exports = mongoose.model('Video', videoSchema);
