const Activity = require('../../models/Activity');
const aiService = require('../../services/aiService');
const { withMiddleware } = require('../../lib/withMiddleware');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, history } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const response = await aiService.chatWithAI(prompt, history || []);

    try {
      await Activity.create({
        user: req.user._id,
        type: 'ai_chat',
        query: prompt,
        response: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
      });
    } catch (_) {}

    return res.status(200).json({ response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get AI response' });
  }
};

module.exports = withMiddleware(handler, 'student');
