const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate password
// Rule: first digit of rollNo + firstName + last digit of rollNo
const generatePassword = (name, rollNo) => {
  if (!name || !rollNo) return 'Welcome123'; // Fallback

  const firstName = name.split(' ')[0];
  const rollStr = String(rollNo);
  const firstDigit = rollStr[0];
  const lastDigit = rollStr[rollStr.length - 1];

  return `${firstDigit}${firstName}${lastDigit}`;
};

// @desc    Upload users via Excel
// @route   POST /api/admin/upload-excel
// @access  Private/Admin
const uploadUsersExcel = async (req, res) => {
  console.log('--- Start Excel Upload Processing ---');
  if (!req.file) {
    console.log('No file found in request');
    return res.status(400).json({ message: 'Please upload an Excel file' });
  }

  try {
    console.log('Reading file buffer...');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    console.log(`Found ${rawData.length} rows in Excel`);

    if (rawData.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const requiredFields = ['name', 'email', 'branch', 'year', 'rollNo'];
    let createdCount = 0;
    let skippedCount = 0;
    const samplePasswords = [];
    const errors = [];

    for (let i = 0; i < rawData.length; i++) {
        try {
            const row = rawData[i];
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim()] = row[key];
            });

            const { name, email, branch, year, rollno } = normalizedRow;
            const rollNo = rollno;

            const missing = requiredFields.filter(f => !normalizedRow[f.toLowerCase()]);
            if (missing.length > 0) {
                errors.push(`Row ${i + 2}: Missing ${missing.join(', ')}`);
                console.log(`Row ${i + 2} skipped: Missing fields`);
                skippedCount++;
                continue;
            }

            const userExists = await User.findOne({ email: String(email).trim().toLowerCase() });
            if (userExists) {
                console.log(`Row ${i + 2} skipped: User ${email} already exists`);
                skippedCount++;
                continue;
            }

            const plainPassword = generatePassword(String(name).trim(), String(rollNo).trim());
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);

            await User.create({
                name: String(name).trim(),
                email: String(email).trim().toLowerCase(),
                password: hashedPassword,
                role: 'student',
                branch: String(branch).trim(),
                year: Number(year),
                rollNo: String(rollNo).trim(),
                createdBy: req.user._id
            });

            console.log(`Row ${i + 2} success: Created ${email}`);
            createdCount++;

            if (samplePasswords.length < 5) {
                samplePasswords.push({ email, password: plainPassword });
            }
        } catch (rowErr) {
            console.error(`Error in row ${i + 2}:`, rowErr.message);
            errors.push(`Row ${i + 2}: ${rowErr.message}`);
            skippedCount++;
        }
    }

    console.log(`Summary: Created ${createdCount}, Skipped ${skippedCount}`);
    res.status(201).json({
      message: errors.length > 0 ? 'Processing complete with some errors' : 'Processing complete',
      created: createdCount,
      skipped: skippedCount,
      samplePasswords,
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('Fatal Excel Upload Error:', error);
    res.status(500).json({ message: 'Fatal error processing Excel file: ' + error.message });
  }
};

// @desc    Manually create a user (Teacher/Student)
// @route   POST /api/admin/create-user
// @access  Private/Admin
const createManualUser = async (req, res) => {
  const { name, email, password, role, branch, year, rollNo, subject } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      branch,
      year,
      rollNo,
      subject,
      createdBy: req.user._id
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get teachers created by this admin
// @route   GET /api/admin/added-teachers
// @access  Private/Admin
const getAddedTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ 
      createdBy: req.user._id, 
      role: 'teacher' 
    }).select('-password').sort({ createdAt: -1 });
    
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle block/unblock for a user
// @route   PATCH /api/admin/toggle-block/:id
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user details
// @route   PUT /api/admin/update-user/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  const { name, email, subject } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (subject) user.subject = subject;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/delete-user/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadUsersExcel,
  createManualUser,
  getAddedTeachers,
  toggleBlockUser,
  updateUser,
  deleteUser
};
