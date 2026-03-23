const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { connectDB } = require('./db');

/**
 * Verify the Bearer token and attach req.user.
 * Returns null if token is valid, or sends an error response and returns false.
 */
const runProtect = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return false;
  }

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return false;
    }
    req.user = user;
    return true;
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token failed' });
    return false;
  }
};

/**
 * Wrap a handler with DB connection + JWT auth + optional role check.
 *
 * Usage:
 *   module.exports = withMiddleware(handler, 'student');
 *   module.exports = withMiddleware(handler, 'teacher');
 *   module.exports = withMiddleware(handler); // auth only, no role restriction
 */
const withMiddleware = (handler, role) => {
  return async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
      await connectDB();
    } catch (err) {
      return res.status(500).json({ message: 'Database connection failed', error: err.message });
    }

    const ok = await runProtect(req, res);
    if (!ok) return;

    if (role && req.user.role !== role) {
      return res.status(403).json({
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      });
    }

    return handler(req, res);
  };
};

module.exports = { withMiddleware };
