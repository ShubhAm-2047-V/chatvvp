const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Testing with API Key:", apiKey ? apiKey.substring(0, 8) + '...' : 'MISSING');
    
    if (!apiKey) {
        console.error("No API Key found in .env");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello!");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (error) {
        console.error("Gemini Test Failed:");
        console.error(error.message || error);
        process.exit(1);
    }
}

testGemini();
