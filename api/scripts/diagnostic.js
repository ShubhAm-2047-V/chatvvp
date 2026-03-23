const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

async function diagnostic() {
    console.log("--- GEMINI DIAGNOSTIC ---");
    console.log("Key Prefix:", apiKey ? apiKey.substring(0, 10) : "MISSING");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-pro"];

    for (const modelName of modelsToTry) {
        console.log(`\nTrying model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`SUCCESS [${modelName}]: ${response.text().substring(0, 20)}...`);
            return; // EXIT ON FIRST SUCCESS
        } catch (error) {
            console.error(`FAILED [${modelName}]: ${error.message}`);
        }
    }
    console.log("\n--- DIAGNOSTIC COMPLETE: ALL FAILED ---");
}

diagnostic();
