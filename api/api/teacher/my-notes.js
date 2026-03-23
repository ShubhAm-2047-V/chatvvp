const Note = require('../../models/Note');
const { withMiddleware } = require('../../lib/withMiddleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const notes = await Note.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ notes });
  } catch (error) {
    console.error('Get My Notes Error:', error);
    return res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

module.exports = withMiddleware(handler, 'teacher');
