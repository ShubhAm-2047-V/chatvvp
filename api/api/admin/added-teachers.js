const User = require('../../models/User');
const { withMiddleware } = require('../../lib/withMiddleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const teachers = await User.find({ createdBy: req.user._id, role: 'teacher' })
      .select('-password')
      .sort({ createdAt: -1 });
    return res.status(200).json(teachers);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = withMiddleware(handler, 'admin');
