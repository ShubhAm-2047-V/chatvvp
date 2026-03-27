const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));
app.use(express.json());
app.use(express.static('public')); // Serve website files

// Request logger for debugging network connectivity
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully ✅');
    bootstrapAdmin();
  })
  .catch((err) => {
    console.error('MongoDB connection error ❌:', err.message);
  });

const User = require('./models/User');
const Note = require('./models/Note');
const Video = require('./models/Video');
const Activity = require('./models/Activity');
const PersonalNote = require('./models/PersonalNote');

const bootstrapAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@test.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default Admin Account Created: admin@test.com / admin123 🔑');
    }
  } catch (err) {
    console.error('Error bootstrapping admin:', err.message);
  }
};
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const xlsx = require('xlsx');
const aiService = require('./services/aiService');
const { preprocessImage, cleanOCRText } = require('./utils/ocrHelper');
const { cleanTextWithAI } = require('./utils/aiHelper');
const { formatNotes } = require('./utils/noteFormatter');
const { sendNoteNotification } = require('./utils/emailHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_123';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Middleware for authentication
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    // In local testing, we might still have 'dummy_jwt_token_for_local_testing'
    if (token === 'dummy_jwt_token_for_local_testing') {
      // Find a default admin or first user for testing if no real JWT is present
      const admin = await User.findOne({ role: 'admin' });
      req.user = admin;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const verifyRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Unauthorized role' });
  }
  next();
};

// Mock User Database (REMOVED - now using MongoDB)

// Routes
// 1. Health Check
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API working locally 🚀',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 2. Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalNotes = await Note.countDocuments(); // Fixed: No longer hardcoded to 124

    res.json({
      totalStudents,
      totalTeachers,
      totalNotes,
      activeUsers: 42
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Admin User List
app.get('/api/admin/users', verifyToken, verifyRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Added Teachers List (for dashboard)
app.get('/api/admin/added-teachers', verifyToken, verifyRole(['admin']), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Block
app.patch('/api/admin/toggle-block/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User
app.put('/api/admin/update-user/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
  try {
    const { name, email, subject } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (subject) user.subject = subject;
    
    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Admin Create User
app.post('/api/admin/create-user', async (req, res) => {
  const { name, email, password, role, branch, year, subject } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      branch,
      year,
      subject
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin Delete User
app.delete('/api/admin/delete-user/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    const userToDelete = await User.findById(id);
    if (!userToDelete) return res.status(404).json({ message: 'User not found' });

    if (userToDelete.email === 'admin@test.com') {
      return res.status(403).json({ error: 'Primary Admin account cannot be deleted' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Admin Upload Excel
app.post('/api/admin/upload-excel', verifyToken, verifyRole(['admin']), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload an Excel file' });

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    let createdCount = 0, skippedCount = 0;
    const samplePasswords = [], errors = [];

    const generatePassword = (name, rollNo) => {
      const firstName = name.split(' ')[0];
      const rollStr = String(rollNo);
      return `${rollStr[0] || '1'}${firstName}${rollStr[rollStr.length - 1] || '!'}`;
    };

    for (let i = 0; i < rawData.length; i++) {
      try {
        const row = rawData[i];
        const n = {};
        Object.keys(row).forEach((k) => { n[k.toLowerCase().trim()] = row[k]; });
        const { name, email, branch, year, rollno } = n;

        if (!name || !email) { skippedCount++; continue; }
        if (await User.findOne({ email: String(email).trim().toLowerCase() })) { skippedCount++; continue; }

        const plainPassword = generatePassword(String(name).trim(), String(rollno || '0000').trim());
        const hashedPassword = await bcrypt.hash(plainPassword, await bcrypt.genSalt(10));

        await User.create({
          name: String(name).trim(), email: String(email).trim().toLowerCase(),
          password: hashedPassword, role: 'student',
          branch: String(branch || 'General').trim(), year: Number(year) || 1,
          rollNo: String(rollno || '').trim(), createdBy: req.user._id,
        });
        createdCount++;
        if (samplePasswords.length < 5) samplePasswords.push({ email, password: plainPassword });
      } catch (rowErr) { errors.push(`Row ${i+2}: ${rowErr.message}`); skippedCount++; }
    }
    res.status(201).json({ created: createdCount, skipped: skippedCount, samplePasswords, errors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DB Test
app.get('/api/db-test', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    res.json({
      message: 'MongoDB status checked ✅',
      status: states[state] || 'unknown',
      connection: state === 1 ? 'Working' : 'Not Connected'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Auth Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Database User Search
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('Login failed: User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Password Comparison
    const isMatched = await bcrypt.compare(password, user.password);
    let loginAllowed = false;

    if (isMatched) {
      loginAllowed = true;
    } else if (password === user.password) {
      // Temporary fallback for plain text passwords
      console.log('Login success via Plain Text Fallback (Warning!)');
      loginAllowed = true;
    }

    if (!loginAllowed) {
      console.log('Login failed: Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('Login success for:', user.name, `(${user.role})`);

    res.json({
      message: 'Login success',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
        subject: user.subject
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 12. Update Profile
app.put('/api/auth/update-profile', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Teacher Upload Note
app.post('/api/teacher/upload-note', verifyToken, verifyRole(['teacher']), upload.single('file'), async (req, res) => {
  const { subject, branch, year, topic, youtubeUrl } = req.body;

  if (!subject || !branch || !year || !topic) {
    return res.status(400).json({ message: 'Please provide subject, branch, year, and topic' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file (Image or PDF)' });
  }

  try {
    let processedBuffer = req.file.buffer;
    if (req.file.mimetype.startsWith('image/')) {
        try {
            processedBuffer = await preprocessImage(req.file.buffer);
        } catch (e) {
            console.warn('Image preprocessing failed, using original:', e.message);
        }
    }

    // Upload to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'college_notes', resource_type: 'auto' },
        (error, result) => (result ? resolve(result) : reject(error))
      );
      stream.end(req.file.buffer);
    });
    const imageUrl = cloudinaryResult.secure_url;

    // OCR
    let rawOCRText = '';
    let extractedText = '';
    let aiCleanedText = '';
    const OCR_API_KEY = process.env.OCR_SPACE_API_KEY || 'helloworld';

    try {
      const base64Image = `data:${req.file.mimetype};base64,${processedBuffer.toString('base64')}`;
      const formData = new URLSearchParams();
      formData.append('apikey', OCR_API_KEY);
      formData.append('base64Image', base64Image);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('OCREngine', '2');

      const ocrResponse = await axios.post('https://api.ocr.space/parse/image', formData);
      if (ocrResponse.data?.ParsedResults?.[0]) {
        rawOCRText = ocrResponse.data.ParsedResults[0].ParsedText;
        extractedText = cleanOCRText(rawOCRText);
        aiCleanedText = await cleanTextWithAI(extractedText);
      }
    } catch (ocrErr) {
      console.error('OCR Error:', ocrErr.message);
      rawOCRText = 'OCR system error: ' + ocrErr.message;
    }

    const finalCleaned = aiCleanedText || extractedText || rawOCRText;
    const { formattedText, sections } = formatNotes(finalCleaned);
    const isLowConfidence = !finalCleaned || finalCleaned.trim().length < 10;

    const note = await Note.create({
      teacherId: req.user._id,
      subject,
      branch,
      year: Number(year),
      topic,
      imageUrl,
      cleanedText: finalCleaned,
      formattedText,
      sections,
      youtubeUrl: youtubeUrl || '',
      rawText: rawOCRText,
    });

    if (youtubeUrl && youtubeUrl.trim().startsWith('http')) {
      await Video.create({
        teacherId: req.user._id,
        subject,
        topic,
        url: youtubeUrl.trim(),
        title: `${subject} - ${topic}`,
      });
    }

    res.status(201).json({
      message: isLowConfidence ? 'Note uploaded with low confidence' : 'Note uploaded successfully',
      note
    });

    // Send email notification to students of same branch & year (non-blocking)
    try {
      const students = await User.find({
        role: 'student',
        branch: { $regex: new RegExp(`^${branch}$`, 'i') },
        year: Number(year)
      });
      const emails = students.map(s => s.email).filter(Boolean);
      if (emails.length > 0) {
        sendNoteNotification(emails, { subject, topic, branch, year }, req.user.name)
          .then(() => console.log(`📧 Notification sent to ${emails.length} students`))
          .catch(err => console.error('📧 Email notification error:', err.message));
      } else {
        console.log('📧 No students found for', branch, 'Year', year);
      }
    } catch (emailErr) {
      console.error('📧 Email lookup error:', emailErr.message);
    }
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4.5 Teacher Dashboard Stats
app.get('/api/teacher/stats', verifyToken, verifyRole(['teacher']), async (req, res) => {
  try {
    const totalNotes = await Note.countDocuments({ teacherId: req.user._id });
    
    // Get all note IDs for this teacher to count views from Activity collection
    const notes = await Note.find({ teacherId: req.user._id }, '_id');
    const noteIds = notes.map(n => n._id);
    
    const totalViews = await Activity.countDocuments({ 
      type: 'view_note', 
      refId: { $in: noteIds } 
    });

    res.json({
      totalNotes,
      totalViews
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 4. Teacher My Notes
app.get('/api/teacher/my-notes', verifyToken, verifyRole(['teacher']), async (req, res) => {
  try {
    const notes = await Note.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.1 Teacher Delete Note
app.delete('/api/teacher/notes/:id', verifyToken, verifyRole(['teacher']), async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, teacherId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found or not authorized' });
    
    // Also cleanup any associated video
    if (note.youtubeUrl) {
      await Video.findOneAndDelete({ url: note.youtubeUrl, teacherId: req.user._id });
    }
    
    // Cleanup associated activity
    await Activity.deleteMany({ refId: req.params.id });

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Teacher Create Text Note
app.post('/api/teacher/text-note', verifyToken, verifyRole(['teacher']), async (req, res) => {
  try {
    const { content, subject, branch, year, topic } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const { formattedText, sections } = formatNotes(content);
    const note = await Note.create({
      teacherId: req.user._id,
      subject: subject || 'General',
      branch: branch || 'All',
      year: Number(year) || 1,
      topic: topic || 'Text Note',
      cleanedText: content,
      formattedText,
      sections,
      rawText: content
    });
    res.status(201).json({ message: 'Note created', note });

    // Send email notification to students (New: Added for text-notes)
    try {
      const students = await User.find({
        role: 'student',
        branch: { $regex: new RegExp(`^${branch || 'All'}$`, 'i') },
        year: Number(year) || 1
      });
      const emails = students.map(s => s.email).filter(Boolean);
      if (emails.length > 0) {
        sendNoteNotification(emails, { 
          subject: subject || 'General', 
          topic: topic || 'Text Note', 
          branch: branch || 'All', 
          year: Number(year) || 1 
        }, req.user.name)
          .then(() => console.log(`📧 Notification sent to ${emails.length} students for text note`))
          .catch(err => console.error('📧 Email notification error (text note):', err.message));
      }
    } catch (emailErr) {
      console.error('📧 Email lookup error (text note):', emailErr.message);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Student Routes
app.get('/api/student/search', verifyToken, verifyRole(['student', 'admin']), async (req, res) => {
  try {
    const { subject, query } = req.query;
    const { branch, year } = req.user;

    if (!subject) return res.status(400).json({ message: 'Subject required' });

    let dbQuery = { 
      $or: [
        { 
          branch: { $regex: new RegExp(`^${branch}$`, 'i') }, 
          year: Number(year), 
          subject: { $regex: new RegExp(`^${subject}$`, 'i') } 
        },
        { branch: { $regex: /^(All|General)$/i }, subject: { $regex: new RegExp(`^${subject}$`, 'i') } }
      ]
    };
    if (req.user.role !== 'student') dbQuery = { subject };

    let projection = {};
    let sort = { createdAt: -1 };

    if (query && query.trim() !== '') {
      dbQuery.$text = { $search: query };
      projection.score = { $meta: 'textScore' };
      sort = { score: { $meta: 'textScore' } };
    }

    const notes = await Note.find(dbQuery, projection).sort(sort).limit(10);
    try { await Activity.create({ user: req.user._id, type: 'search', query: query || '', subject }); } catch (_) {}
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Student AI Explain
app.post('/api/student/explain', verifyToken, verifyRole(['student']), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text required' });

    const explanation = await aiService.explainText(text);
    try {
      await Activity.create({
        user: req.user._id,
        type: 'ai_explain',
        query: text.substring(0, 50),
        response: explanation.substring(0, 50)
      });
    } catch (_) {}
    res.json({ explanation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Student AI Chat
app.post('/api/student/chat', verifyToken, verifyRole(['student', 'teacher', 'admin']), async (req, res) => {
  try {
    const { prompt, history } = req.body;
    const response = await aiService.chatWithAI(prompt, history || []);
    try {
      await Activity.create({ user: req.user._id, type: 'ai_chat', query: prompt });
    } catch (_) {}
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Student History
app.get('/api/student/history', verifyToken, async (req, res) => {
  try {
    const history = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9.5 Student Library Notes (Filtered by Profile)
app.get('/api/student/notes', verifyToken, verifyRole(['student', 'admin']), async (req, res) => {
  try {
    const { role, branch, year } = req.user;
    let query = {};
    
    // Students see notes restricted to their academic profile
    if (role === 'student') {
      if (!branch || !year) {
        return res.status(400).json({ message: 'User profile missing academic metadata' });
      }
      query = { 
        $or: [
          { branch: { $regex: new RegExp(`^${branch}$`, 'i') }, year: Number(year) },
          { branch: { $regex: /^(All|General)$/i } }
        ]
      };
    }
    
    const notes = await Note.find(query).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch single note for detail view
app.get('/api/student/notes/:id', verifyToken, verifyRole(['student', 'teacher', 'admin']), async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record Note View
app.post('/api/student/activity/view-note', verifyToken, async (req, res) => {
  try {
    const { noteId, topic, subject } = req.body;
    await Activity.create({
      user: req.user._id,
      type: 'view_note',
      refId: noteId,
      topic,
      subject
    });
    res.json({ message: 'Activity recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record Video Watch
app.post('/api/student/activity/watch-video', verifyToken, async (req, res) => {
  try {
    const { videoUrl, topic, subject } = req.body;
    await Activity.create({
      user: req.user._id,
      type: 'watch_video',
      topic,
      subject,
      metadata: { videoUrl }
    });
    res.json({ message: 'Activity recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Teacher Personal Notes
app.get('/api/teacher/personal-notes', verifyToken, verifyRole(['teacher', 'admin']), async (req, res) => {
  try {
    const notes = await PersonalNote.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teacher/personal-notes', verifyToken, verifyRole(['teacher', 'admin']), async (req, res) => {
  try {
    const { title, content, color } = req.body;
    const note = await PersonalNote.create({
      user: req.user._id,
      title,
      content,
      color: color || '#FFF'
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/teacher/personal-notes/:id', verifyToken, verifyRole(['teacher', 'admin']), async (req, res) => {
  try {
    const { title, content, color } = req.body;
    const note = await PersonalNote.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content, color },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/teacher/personal-notes/:id', verifyToken, verifyRole(['teacher', 'admin']), async (req, res) => {
  try {
    const note = await PersonalNote.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Student Personal Notes
app.get('/api/student/personal-notes', verifyToken, verifyRole(['student']), async (req, res) => {
  try {
    const notes = await PersonalNote.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/student/personal-notes', verifyToken, verifyRole(['student']), async (req, res) => {
  try {
    const { title, content, color } = req.body;
    const note = await PersonalNote.create({
      user: req.user._id,
      title,
      content,
      color: color || '#4F46E5'
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/student/personal-notes/:id', verifyToken, verifyRole(['student']), async (req, res) => {
  try {
    const { title, content, color } = req.body;
    const note = await PersonalNote.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content, color },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/student/personal-notes/:id', verifyToken, verifyRole(['student']), async (req, res) => {
  try {
    const note = await PersonalNote.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Teacher Personal Notes
// ... (omitted similar lines)

const quizRoutes = require('./routes/quizRoutes');
app.use('/api/quizzes', quizRoutes);

// Error handling for 404
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

app.listen(PORT, () => {
  console.log(`🚀 Local Server running on http://localhost:${PORT}`);
  console.log(`📡 Network API reachable at http://10.155.182.188:${PORT}/api`);
});
