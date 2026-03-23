const { GoogleGenerativeAI } = require("@google/generative-ai");

// DIRECT TEST OF THE NEW KEY PROVIDE BY USER
const apiKey = "AIzaSyCk_nXgir1Ay4Te7XPDl5dPToXfqPKaKIQ"; 

async function testGemini() {
    console.log("Testing Gemini with NEW key:", apiKey);
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
