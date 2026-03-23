const Note = require('../../models/Note');
const Video = require('../../models/Video');
const Activity = require('../../models/Activity');
const { withMiddleware } = require('../../lib/withMiddleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { subject, query } = req.query;
    const branch = req.user.branch;
    const year = req.user.year;

    if (!subject) {
      return res.status(400).json({ message: 'Please provide the subject to search' });
    }

    let dbQuery = { branch, year: Number(year), subject };
    let projection = {};
    let sort = { createdAt: -1 };

    if (query && query.trim() !== '') {
      dbQuery.$text = { $search: query };
      projection.score = { $meta: 'textScore' };
      sort = { score: { $meta: 'textScore' } };
    }

    const notes = await Note.find(dbQuery, projection)
      .sort(sort)
      .limit(10)
      .select('topic formattedText imageUrl youtubeUrl createdAt subject');

    if (!notes || notes.length === 0) {
      return res.status(404).json({ message: 'No notes found matching your criteria' });
    }

    const notesWithVideos = await Promise.all(
      notes.map(async (n) => {
        const noteObj = n.toObject();
        if (!noteObj.youtubeUrl) {
          const video = await Video.findOne({
            subject: { $regex: new RegExp(`^${noteObj.subject || subject}$`, 'i') },
            topic: { $regex: new RegExp(noteObj.topic, 'i') },
          }).select('url');
          if (video) noteObj.youtubeUrl = video.url;
        }
        return noteObj;
      })
    );

    try {
      await Activity.create({ user: req.user._id, type: 'search', query: query || '', subject });
    } catch (_) {}

    return res.status(200).json(notesWithVideos);
  } catch (error) {
    console.error('Student Search Error:', error);
    return res.status(500).json({ message: 'Server error during note search', error: error.message });
  }
};

module.exports = withMiddleware(handler, 'student');
