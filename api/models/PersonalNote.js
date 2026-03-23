const mongoose = require('mongoose');

const personalNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '#FFF',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PersonalNote', personalNoteSchema);
