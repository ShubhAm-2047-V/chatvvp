const Video = require('../../models/Video');
const { withMiddleware } = require('../../lib/withMiddleware');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { subject, topic, url, title } = req.body;

  if (!subject || !topic || !url) {
    return res.status(400).json({ message: 'Subject, topic, and URL are required' });
  }

  try {
    const video = await Video.create({
      teacherId: req.user._id,
      subject,
      topic,
      url,
      title: title || `${subject} - ${topic}`,
    });

    return res.status(201).json({ message: 'Video link added successfully', video });
  } catch (error) {
    console.error('Add Video Link Error:', error);
    return res.status(500).json({ message: 'Error adding video link', error: error.message });
  }
};

module.exports = withMiddleware(handler, 'teacher');
