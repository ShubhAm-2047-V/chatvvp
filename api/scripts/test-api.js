const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyApi = async () => {
    try {
        // Need a token for admin1
        // Since I don't have the password, I'll generate a token manually if I have the secret
        // The secret is in .env
        const adminId = '69b957d1a98fbca82214e200'; // from check-teachers.js
        const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        const res = await axios.get('http://localhost:5001/api/admin/added-teachers', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('API RESPONSE:', res.data);
    } catch (e) {
        console.error('API ERROR:', e.response ? e.response.status : e.message);
        if (e.response) console.error('Data:', e.response.data);
    }
};

verifyApi();
