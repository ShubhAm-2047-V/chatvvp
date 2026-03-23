const Note = require('../../../models/Note');
const { withMiddleware } = require('../../../lib/withMiddleware');

// Handles DELETE /api/teacher/my-notes/:id
const handler = async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const note = await Note.findOne({ _id: id, teacherId: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized' });
    }

    await note.deleteOne();
    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete Note Error:', error);
    return res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};

module.exports = withMiddleware(handler, 'teacher');
