const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { connectDB } = require('../../lib/db');

/**
 * Senior-engineered, crash-proof Signup Handler for Vercel Serverless.
 */
module.exports = async (req, res) => {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('--- Signup Request Started ---');

    // 2. Method Validation
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 3. Ensure safe DB connection
    try {
      await connectDB();
    } catch (dbErr) {
      console.error('Database connection failed:', dbErr);
      return res.status(500).json({ error: 'Database connection failed', details: dbErr.message });
    }

    // 4. Handle JSON parsing
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

    const { name, email, password, role, branch, year } = body;
    console.log('Signup attempt for:', email);

    // 5. Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const emailLower = String(email).trim().toLowerCase();

    // 6. Check if user exists
    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      console.log('Signup failed: User already exists ->', emailLower);
      return res.status(400).json({ error: 'User already exists' });
    }

    // 7. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 8. Create user
    const user = await User.create({
      name: String(name).trim(),
      email: emailLower,
      password: hashedPassword,
      role: role || 'student',
      branch,
      year: Number(year) || 0,
    });

    // 9. Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    console.log('Signup success ->', emailLower);

    // 10. Success Response
    return res.status(201).json({
      message: 'Registration success',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('CRITICAL SIGNUP CRASH:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};
