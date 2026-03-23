const Note = require('../models/Note');
const Video = require('../models/Video');
const Activity = require('../models/Activity');
const aiService = require('../services/aiService');

// @desc    Search for notes
// @route   GET /api/student/search
// @access  Private (Student)
const searchNotes = async (req, res) => {
  try {
    // 1. Get branch/year from user profile (instead of query params)
    const { subject, query } = req.query;
    const branch = req.user.branch;
    const year = req.user.year;

    // 2. Validation: Mandatory parameters
    if (!subject) {
      return res.status(400).json({ 
        message: 'Please provide the subject to search' 
      });
    }

    // 3. Build Query Object
    let dbQuery = {
      branch: branch,
      year: Number(year),
      subject: subject
    };

    let projection = {};
    let sort = { createdAt: -1 }; // Default: Newest first

    // 3. Apply Text Search if query is provided
    if (query && query.trim() !== '') {
      dbQuery.$text = { $search: query };
      // Sort by relevance score if text searching
      projection.score = { $meta: 'textScore' };
      sort = { score: { $meta: 'textScore' } };
    }

    // 4. Fetch Results
    const notes = await Note.find(dbQuery, projection)
      .sort(sort)
      .limit(10)
      .select('topic formattedText imageUrl youtubeUrl createdAt');

    // 5. Check if results found
    if (!notes || notes.length === 0) {
      return res.status(404).json({ message: 'No notes found matching your criteria' });
    }

    // 6. Dynamic Video Link Lookup: If a note doesn't have a youtubeUrl, try to find one in the Video collection
    const notesWithVideos = await Promise.all(notes.map(async (n) => {
      const noteObj = n.toObject();
      if (!noteObj.youtubeUrl) {
        // Try to find a matching video link for this subject and topic
        const video = await Video.findOne({
          subject: { $regex: new RegExp(`^${noteObj.subject || subject}$`, 'i') },
          topic: { $regex: new RegExp(noteObj.topic, 'i') }
        }).select('url');
        
        if (video) {
          noteObj.youtubeUrl = video.url;
        }
      }
      return noteObj;
    }));

    // 7. Save Activity
    try {
      await Activity.create({
        user: req.user._id,
        type: 'search',
        query: query || '',
        subject: subject
      });
    } catch (actErr) {
      console.error('Activity Logging Error (Search):', actErr);
    }

    // 8. Return Cleaned Response
    res.status(200).json(notesWithVideos);

  } catch (error) {
    console.error('Student Search Error:', error);
    res.status(500).json({ 
      message: 'Server error during note search', 
      error: error.message 
    });
  }
};

// @desc    Get AI explanation for a note
// @route   POST /api/student/explain
// @access  Private (Student)
const explainNote = async (req, res) => {
  try {
    const { text } = req.body;

    // 1. Validation: Check if text is empty
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Content text is required' });
    }

    // 2. Call AI Service
    const explanation = await aiService.explainText(text);
    
    // 3. Save Activity
    try {
      await Activity.create({
        user: req.user._id,
        type: 'ai_explain',
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        response: explanation.substring(0, 200) + (explanation.length > 200 ? '...' : '')
      });
    } catch (actErr) {
      console.error('Activity Logging Error (Explain):', actErr);
    }

    // 4. Return response as requested
    res.status(200).json({ 
        explanation: explanation 
    });

  } catch (error) {
    console.error('Explain Note Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate AI explanation' 
    });
  }
};

// @desc    Chat with AI Assistant
// @route   POST /api/student/chat
// @access  Private (Student)
const aiChat = async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const response = await aiService.chatWithAI(prompt, history || []);

    // 3. Save Activity
    try {
      await Activity.create({
        user: req.user._id,
        type: 'ai_chat',
        query: prompt,
        response: response.substring(0, 200) + (response.length > 200 ? '...' : '')
      });
    } catch (actErr) {
      console.error('Activity Logging Error (Chat):', actErr);
    }
    
    res.status(200).json({ response });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to get AI response' 
    });
  }
};

// @desc    Get relevant YouTube playlists
// @route   GET /api/student/youtube
// @access  Private (Student)
const getYoutubeVideos = async (req, res) => {
  try {
    const { subject, topic } = req.query;

    if (!subject || !topic) {
      return res.status(400).json({ message: 'Subject and topic are required' });
    }

    // Query the database: exact subject + case-insensitive topic regex
    const videos = await Video.find({
      subject: { $regex: new RegExp(`^${subject}$`, 'i') },
      topic: { $regex: new RegExp(topic, 'i') }
    }).select('title subject topic url').lean();

    if (videos.length > 0) {
      return res.status(200).json({
        videos: videos.map(v => ({
          title: v.title || `${v.subject} - ${v.topic}`,
          url: v.url
        }))
      });
    }

    // Fallback: Default YouTube search link
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subject} ${topic}`)}`;
    res.status(200).json({
      videos: [
        {
          title: `Search YouTube for "${subject} ${topic}"`,
          url: searchUrl
        }
      ]
    });

  } catch (error) {
    console.error('YouTube Integration Error:', error);
    res.status(500).json({ message: 'Server error fetching videos' });
  }
};

// @desc    Get student activity history
// @route   GET /api/student/history
// @access  Private (Student)
const getStudentHistory = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching history' });
  }
};

module.exports = {
  searchNotes,
  explainNote,
  aiChat,
  getYoutubeVideos,
  getStudentHistory
};
