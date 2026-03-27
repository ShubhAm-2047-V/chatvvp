const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testSDK() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];

  for (const m of models) {
    console.log(`\nTesting SDK model: ${m}...`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Respond with 'OK'.");
      const response = await result.response;
      console.log(`✅ Success for ${m}:`, response.text());
    } catch (error) {
      console.error(`❌ Error for ${m}:`, error.message);
    }
  }
}

testSDK();
