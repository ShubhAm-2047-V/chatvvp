const Video = require('../../models/Video');
const { withMiddleware } = require('../../lib/withMiddleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { subject, topic } = req.query;

    if (!subject || !topic) {
      return res.status(400).json({ message: 'Subject and topic are required' });
    }

    const videos = await Video.find({
      subject: { $regex: new RegExp(`^${subject}$`, 'i') },
      topic: { $regex: new RegExp(topic, 'i') },
    })
      .select('title subject topic url')
      .lean();

    if (videos.length > 0) {
      return res.status(200).json({
        videos: videos.map((v) => ({
          title: v.title || `${v.subject} - ${v.topic}`,
          url: v.url,
        })),
      });
    }

    // Fallback: YouTube search link
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subject} ${topic}`)}`;
    return res.status(200).json({
      videos: [{ title: `Search YouTube for "${subject} ${topic}"`, url: searchUrl }],
    });
  } catch (error) {
    console.error('YouTube Integration Error:', error);
    return res.status(500).json({ message: 'Server error fetching videos' });
  }
};

module.exports = withMiddleware(handler, 'student');
