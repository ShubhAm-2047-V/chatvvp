const Activity = require('../../models/Activity');
const aiService = require('../../services/aiService');
const { withMiddleware } = require('../../lib/withMiddleware');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Content text is required' });
    }

    const explanation = await aiService.explainText(text);

    try {
      await Activity.create({
        user: req.user._id,
        type: 'ai_explain',
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        response: explanation.substring(0, 200) + (explanation.length > 200 ? '...' : ''),
      });
    } catch (_) {}

    return res.status(200).json({ explanation });
  } catch (error) {
    console.error('Explain Note Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to generate AI explanation' });
  }
};

module.exports = withMiddleware(handler, 'student');
