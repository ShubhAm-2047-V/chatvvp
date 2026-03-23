const Activity = require('../../models/Activity');
const { withMiddleware } = require('../../lib/withMiddleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json(activities);
  } catch (error) {
    console.error('History Error:', error);
    return res.status(500).json({ message: 'Server error fetching history' });
  }
};

module.exports = withMiddleware(handler, 'student');
