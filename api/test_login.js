const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    console.log('Login Test Success! Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Login Test Failed! Error:', error.response?.data || error.message);
  }
}

testLogin();
