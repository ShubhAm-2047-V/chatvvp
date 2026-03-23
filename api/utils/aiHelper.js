const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Cleans and corrects OCR text using Gemini AI.
 * @param {string} rawText - The raw text from OCR.space.
 * @returns {string} - The AI-corrected text.
 */
const cleanTextWithAI = async (rawText) => {
  if (!rawText || rawText.length < 5) return rawText;

  try {
    console.log('--- AI Text Cleanup Started ---');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an expert in correcting OCR output from handwritten technical notes, especially programming and assembly code.

      Fix the following OCR text carefully according to these rules:
      1. Correct spelling mistakes.
      2. Fix programming keywords (e.g., mov, add, loop, int, cmp, etc.).
      3. Fix variable names like 'src_arr', 'dst_arr', etc.
      4. Fix specific symbol errors: 
         - Change "*O" to "≠ 0"
         - Keep "@" symbols as "@"
      5. Maintain the original structure and formatting.
      6. Do NOT add new content or conversational filler.
      7. Keep assembly syntax and logic correct.

      OCR TEXT:
      ${rawText}

      Return only the corrected version.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanedText = response.text().trim();

    console.log('AI Text Cleanup Success');
    return cleanedText;
  } catch (error) {
    console.error('AI Cleanup Error:', error.message);
    // Fallback to raw text if AI fails
    return rawText;
  }
};

module.exports = {
  cleanTextWithAI
};
