const User = require('../../../models/User');
const { withMiddleware } = require('../../../lib/withMiddleware');

// PUT /api/admin/update-user/:id
const handler = async (req, res) => {
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { id } = req.query;
    const { name, email, subject } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (subject) user.subject = subject;

    await user.save();
    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = withMiddleware(handler, 'admin');
