const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
require('dotenv').config();

async function testFinal() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Testing Gemini 2.0 with key from .env:", apiKey.substring(0, 10) + "...");
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Respond with 'SUCCESS'");
        const response = await result.response;
        console.log("RESULT_START");
        console.log(response.text());
        console.log("RESULT_END");
    } catch (error) {
        console.log("ERROR_START");
        console.log("Error Status:", error.status);
        console.log("Error Message:", error.message);
        console.log("ERROR_END");
    }
}

testFinal();
