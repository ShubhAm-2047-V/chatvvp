const User = require('../../../models/User');
const { withMiddleware } = require('../../../lib/withMiddleware');

// PATCH /api/admin/toggle-block/:id
const handler = async (req, res) => {
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { id } = req.query;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    return res.status(200).json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = withMiddleware(handler, 'admin');
