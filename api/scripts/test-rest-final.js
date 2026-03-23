const axios = require('axios');
require('dotenv').config();

async function testRest() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    console.log("Testing Direct REST with key:", apiKey.substring(0, 10) + "...");
    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Respond with only the word 'REST_READY'" }] }]
        });
        console.log("RESULT_START");
        console.log(response.data.candidates[0].content.parts[0].text);
        console.log("RESULT_END");
    } catch (error) {
        console.log("ERROR_START");
        console.log(error.response?.data || error.message);
        console.log("ERROR_END");
    }
}

testRest();
