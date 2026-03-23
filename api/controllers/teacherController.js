const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const Note = require('../models/Note');
const Video = require('../models/Video');
const { preprocessImage, cleanOCRText } = require('../utils/ocrHelper');
const { cleanTextWithAI } = require('../utils/aiHelper');
const { formatNotes } = require('../utils/noteFormatter');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Upload note with AI-Enhanced OCR and Formatting
// @route   POST /api/teacher/upload-note
// @access  Private (Teacher)
const uploadNote = async (req, res) => {
  const { subject, branch, year, topic } = req.body;

  // Validation
  if (!subject || !branch || !year || !topic) {
    return res.status(400).json({ 
      message: 'Please provide all required fields: subject, branch, year, topic' 
    });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file (Image or PDF)' });
  }

  try {
    console.log('--- AI-Enhanced Teacher Note Upload Started ---');

    // 1. Image Preprocessing
    let processedBuffer = req.file.buffer;
    if (req.file.mimetype.startsWith('image/')) {
      processedBuffer = await preprocessImage(req.file.buffer);
    }

    // 2. Upload ORIGINAL to Cloudinary
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'college_notes', resource_type: 'auto' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    console.log('Uploading original to Cloudinary...');
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    const imageUrl = cloudinaryResult.secure_url;

    // 3. OCR Extraction
    let rawOCRText = '';
    let extractedText = '';
    let aiCleanedText = '';
    const OCR_API_KEY = process.env.OCR_SPACE_API_KEY || 'helloworld';

    try {
      console.log('Performing OCR extraction...');
      const base64Image = `data:${req.file.mimetype};base64,${processedBuffer.toString('base64')}`;

      const formData = new URLSearchParams();
      formData.append('apikey', OCR_API_KEY);
      formData.append('base64Image', base64Image);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('OCREngine', '2');

      const ocrResponse = await axios.post('https://api.ocr.space/parse/image', formData);

      if (ocrResponse.data && ocrResponse.data.ParsedResults && ocrResponse.data.ParsedResults[0]) {
        rawOCRText = ocrResponse.data.ParsedResults[0].ParsedText;
        console.log('OCR Raw Extraction Success');
        
        // 4. Basic Regex Clean
        extractedText = cleanOCRText(rawOCRText);

        // 5. AI Post-Processing Cleanup
        console.log('Sending text to AI for correction...');
        aiCleanedText = await cleanTextWithAI(extractedText);
      } else {
        console.warn('OCR space warning:', ocrResponse.data.ErrorMessage || 'No text found');
      }
    } catch (ocrErr) {
      console.error('OCR.space API Error:', ocrErr.message);
      rawOCRText = 'OCR system error.';
    }

    // Fallback if AI cleanup returned nothing
    const finalCleaned = aiCleanedText || extractedText || rawOCRText;

    // 6. Formatting & Structuring
    console.log('Formatting note structure...');
    const { formattedText, sections } = formatNotes(finalCleaned);

    // 7. Confidence Check / Fallback
    const isLowConfidence = !finalCleaned || finalCleaned.trim().length < 10;
    
    // 8. Save to MongoDB
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
      youtubeUrl: req.body.youtubeUrl || '',
      rawText: rawOCRText
    });

    // 9. Save YouTube link if provided
    const youtubeUrl = req.body.youtubeUrl;
    if (youtubeUrl && youtubeUrl.trim().startsWith('http')) {
      await Video.create({
        teacherId: req.user._id,
        subject,
        topic,
        url: youtubeUrl.trim(),
        title: `${subject} - ${topic}`
      });
    }

    res.status(201).json({
      message: isLowConfidence ? 'Note uploaded with low confidence' : 'Note uploaded and formatted successfully',
      note: {
        _id: note._id,
        subject: note.subject,
        topic: note.topic,
        imageUrl: note.imageUrl,
        textPreview: note.cleanedText.substring(0, 300) + (note.cleanedText.length > 300 ? '...' : ''),
        formattedText: note.formattedText,
        sections: note.sections,
        isAIProcessed: true
      }
    });

  } catch (error) {
    console.error('Teacher Upload Note Error:', error);
    res.status(500).json({ 
      message: 'Error uploading note', 
      error: error.message 
    });
  }
};

// @desc    Add YouTube link for a topic
// @route   POST /api/teacher/youtube
// @access  Private (Teacher)
const addVideoLink = async (req, res) => {
  const { subject, topic, url, title } = req.body;

  if (!subject || !topic || !url) {
    return res.status(400).json({ message: 'Subject, topic, and URL are required' });
  }

  try {
    const video = await Video.create({
      teacherId: req.user._id,
      subject,
      topic,
      url,
      title: title || `${subject} - ${topic}`
    });

    res.status(201).json({
      message: 'Video link added successfully',
      video
    });

  } catch (error) {
    console.error('Add Video Link Error:', error);
    res.status(500).json({ message: 'Error adding video link', error: error.message });
  }
};

// @desc    Create plain text note
// @route   POST /api/teacher/text-note
// @access  Private (Teacher)
const createTextNote = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ 
      message: 'Please write some note content' 
    });
  }

  try {
    // Basic formatting
    const { formattedText, sections } = formatNotes(content);

    // Generate a default topic name based on date or content snippet
    const snippet = content.substring(0, 30).replace(/\n/g, ' ') + '...';

    const note = await Note.create({
      teacherId: req.user._id,
      subject: 'Teacher Note',
      branch: 'All',
      year: 0,
      topic: snippet,
      cleanedText: content,
      formattedText,
      sections,
      youtubeUrl: '',
      rawText: content
    });

    res.status(201).json({
      message: 'Text note created successfully',
      note
    });

  } catch (error) {
    console.error('Create Text Note Error:', error);
    res.status(500).json({ message: 'Error creating text note', error: error.message });
  }
};

// @desc    Get all notes created by this teacher
// @route   GET /api/teacher/my-notes
// @access  Private (Teacher)
const getMyNotes = async (req, res) => {
  try {
    const notes = await Note.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ notes });
  } catch (error) {
    console.error('Get My Notes Error:', error);
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

// @desc    Delete a specific note by teacher
// @route   DELETE /api/teacher/my-notes/:id
// @access  Private (Teacher)
const deleteMyNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found or not authorized' });
    await note.deleteOne();
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete Note Error:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};

module.exports = {
  uploadNote,
  addVideoLink,
  createTextNote,
  getMyNotes,
  deleteMyNote
};
