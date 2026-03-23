const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const multer = require('multer');
const Note = require('../../models/Note');
const Video = require('../../models/Video');
const { preprocessImage, cleanOCRText } = require('../../utils/ocrHelper');
const { cleanTextWithAI } = require('../../utils/aiHelper');
const { formatNotes } = require('../../utils/noteFormatter');
const { withMiddleware } = require('../../lib/withMiddleware');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer with memory storage (no disk writes — safe on serverless)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'), false);
    }
  },
});

// Run multer as a promise so we can await it inside async handler
const runMulter = (req, res) =>
  new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await runMulter(req, res);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

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
      processedBuffer = await preprocessImage(req.file.buffer);
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
      rawOCRText = 'OCR system error.';
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

    return res.status(201).json({
      message: isLowConfidence ? 'Note uploaded with low confidence' : 'Note uploaded successfully',
      note: {
        _id: note._id,
        subject: note.subject,
        topic: note.topic,
        imageUrl: note.imageUrl,
        textPreview: note.cleanedText.substring(0, 300),
        formattedText: note.formattedText,
        sections: note.sections,
        isAIProcessed: true,
      },
    });
  } catch (error) {
    console.error('Upload Note Error:', error);
    return res.status(500).json({ message: 'Error uploading note', error: error.message });
  }
};

// Disable Vercel's default body parser so multer can handle multipart
const wrapped = withMiddleware(handler, 'teacher');
wrapped.config = { api: { bodyParser: false } };
module.exports = wrapped;
