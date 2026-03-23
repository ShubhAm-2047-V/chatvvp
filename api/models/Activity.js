const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['search', 'ai_chat', 'ai_explain', 'view_note', 'watch_video'],
    required: true
  },
  query: String, 
  subject: String,
  topic: String,
  refId: mongoose.Schema.Types.ObjectId, // ID of Note or Video
  metadata: mongoose.Schema.Types.Mixed, // For URLs or extra info
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', ActivitySchema);
