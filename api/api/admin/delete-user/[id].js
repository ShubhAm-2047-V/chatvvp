const User = require('../../../models/User');
const { withMiddleware } = require('../../../lib/withMiddleware');

// DELETE /api/admin/delete-user/:id
const handler = async (req, res) => {
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { id } = req.query;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = withMiddleware(handler, 'admin');
