const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Preprocesses an image to improve OCR accuracy.
 * @param {Buffer} buffer - The image buffer from multer.
 * @returns {Buffer} - The processed image buffer.
 */
const preprocessImage = async (buffer) => {
  try {
    console.log('--- Image Preprocessing Started ---');
    
    // Create a sharp instance from the buffer
    let image = sharp(buffer);
    
    // 1. Get metadata to handle large images
    const metadata = await image.metadata();
    
    // 2. Resize if too large (e.g., max 2000px width/height)
    if (metadata.width > 2000 || metadata.height > 2000) {
      console.log('Resizing image...');
      image = image.resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // 3. Preprocessing Chain:
    // - Convert to grayscale
    // - Increase contrast (linear stretch)
    // - Normalize brightness
    // - Sharpen for better edge detection
    const processedBuffer = await image
      .grayscale()
      .normalize() // Normalizes brightness and contrast
      .sharpen()    // Sharpens edges
      .toBuffer();

    console.log('Image Preprocessing Complete');
    return processedBuffer;
  } catch (error) {
    console.error('Preprocessing Error:', error);
    return buffer; // Fallback to original buffer if processing fails
  }
};

/**
 * Cleans and normalizes text returned by OCR.
 * @param {string} text - Raw OCR text.
 * @returns {string} - Cleaned text.
 */
const cleanOCRText = (text) => {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove garbage symbols and random punctuation
  // Keeps alphanumeric, common punctuation, and basic math symbols
  cleaned = cleaned.replace(/[_]/g, ' '); 
  
  // 2. Fix common OCR mistakes
  const corrections = [
    { pattern: /\b([A-Z])0([A-Z])\b/g, replacement: '$1O$2' }, // 0 -> O inside words
    { pattern: /\b([A-Z])0/g, replacement: '$1O' },            // O at end
    { pattern: /0([A-Z])\b/g, replacement: 'O$1' },            // O at start
    { pattern: /\bcountes\b/gi, replacement: 'counter' },
    { pattern: /\bnor\b/gi, replacement: 'mov' },              // Common in assembly/code notes
    { pattern: /\barr[^\s]*/gi, replacement: 'arr' }           // Normalize arr variations
  ];

  corrections.forEach(c => {
    cleaned = cleaned.replace(c.pattern, c.replacement);
  });

  // 3. Normalize spacing and line breaks
  cleaned = cleaned
    .replace(/[ \t]+/g, ' ')           // Multiple spaces/tabs to single space
    .replace(/\n\s*\n/g, '\n\n')       // Multiple newlines to double newline
    .trim();

  return cleaned;
};

module.exports = {
  preprocessImage,
  cleanOCRText
};
