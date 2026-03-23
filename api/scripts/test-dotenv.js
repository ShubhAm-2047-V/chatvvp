const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Testing Gemini with key from .env:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Respond with 'READY'");
        const response = await result.response;
        console.log("RESULT_START");
        console.log(response.text());
        console.log("RESULT_END");
    } catch (error) {
        console.log("ERROR_START");
        console.log(error.message || error);
        console.log("ERROR_END");
    }
}

testGemini();
