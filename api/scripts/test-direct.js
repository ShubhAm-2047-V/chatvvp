const { GoogleGenerativeAI } = require("@google/generative-ai");

// HARDCODE KEY FOR 1-SECOND TEST (DANGEROUS BUT FOR DEBUGGING ONLY)
// I will delete this file immediately after.
const apiKey = "AIzaSyBn6zKBHTnou-0v4m_C3pV-Ox19dv0Xgpk"; 

async function testGemini() {
    console.log("Testing Gemini with key:", apiKey.substring(0, 10) + "...");
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
