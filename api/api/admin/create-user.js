const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { withMiddleware } = require('../../lib/withMiddleware');

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { name, email, password, role, branch, year, rollNo, subject } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const user = await User.create({
      name, email, password: hashedPassword,
      role: role || 'student', branch, year, rollNo, subject,
      createdBy: req.user._id,
    });

    return res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = withMiddleware(handler, 'admin');
