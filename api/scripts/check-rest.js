const axios = require('axios');
require('dotenv').config();

async function checkKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Checking key via REST:", apiKey);
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);
        console.log("Models found:", response.data.models.map(m => m.name));
        console.log("KEY IS VALID!");
    } catch (error) {
        console.error("REST FAILED:");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

checkKey();
