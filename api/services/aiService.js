const axios = require('axios');

/**
 * Explains study content using direct REST call to Gemini.
 */
async function explainText(text) {
  if (!text) throw new Error("Text is required");
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: `Explain the following study content in simple terms for a diploma student. Keep it short:\n\n${text}` }] }]
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("REST AI Explain error:", error.response?.data || error.message);
    throw new Error("AI Explanation failed");
  }
}

/**
 * Chat with AI using direct REST call.
 */
async function chatWithAI(prompt, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const contents = [
      ...history.map(m => ({
        role: m.role || (m.sender === 'user' ? 'user' : 'model'),
        parts: [{ text: m.parts?.[0]?.text || m.text }]
      })),
      { role: "user", parts: [{ text: `You are a helpful AI Tutor. Answer clearly and concisely.\n\nStudent: ${prompt}` }] }
    ];

    const response = await axios.post(url, { contents });
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("REST AI Chat error:", error.response?.data || error.message);
    throw new Error("AI Assistant failed");
  }
}

module.exports = { explainText, chatWithAI };
