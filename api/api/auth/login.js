const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { connectDB } = require('../../lib/db');

/**
 * Senior-engineered, crash-proof Login Handler for Vercel Serverless.
 */
module.exports = async (req, res) => {
  // 1. CORS Headers (Mandatory for mobile/web cross-origin)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle Options preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Wrap EVERYTHING in try/catch to ensure 100% response delivery
  try {
    console.log('--- Login Request Started ---');

    // 3. Method Validation
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 4. Ensure safe DB connection
    try {
      await connectDB();
    } catch (dbErr) {
      console.error('Database connection failed:', dbErr);
      return res.status(500).json({ error: 'Database connection failed', details: dbErr.message });
    }

    // 5. Handle JSON parsing (Vercel fix for stringified bodies)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    if (!body) {
      return res.status(400).json({ error: 'Request body missing' });
    }

    const { email, password } = body;
    console.log('Login attempt for:', email);

    // 6. Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // 7. Find user safely
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });

    if (!user) {
      console.log('Login failed: User not found ->', email);
      return res.status(404).json({ error: 'User not found' });
    }

    // 8. Compare password safely
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Incorrect password ->', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 9. Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    console.log('Login success ->', email);

    // 10. Final Success Response
    return res.status(200).json({
      message: 'Login success',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      year: user.year,
      token,
    });
  } catch (error) {
    // 11. Catch-all for any unexpected crash
    console.error('CRITICAL LOGIN CRASH:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};
