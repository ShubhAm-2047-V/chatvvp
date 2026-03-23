const Note = require('../../models/Note');
const { formatNotes } = require('../../utils/noteFormatter');
const { withMiddleware } = require('../../lib/withMiddleware');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { content, subject, branch, year, topic } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Please write some note content' });
  }

  try {
    const { formattedText, sections } = formatNotes(content);
    const snippet = content.substring(0, 30).replace(/\n/g, ' ') + '...';

    const note = await Note.create({
      teacherId: req.user._id,
      subject: subject || 'Teacher Note',
      branch: branch || 'All',
      year: Number(year) || 0,
      topic: topic || snippet,
      cleanedText: content,
      formattedText,
      sections,
      youtubeUrl: '',
      rawText: content,
    });

    return res.status(201).json({ message: 'Text note created successfully', note });
  } catch (error) {
    console.error('Create Text Note Error:', error);
    return res.status(500).json({ message: 'Error creating text note', error: error.message });
  }
};

module.exports = withMiddleware(handler, 'teacher');
