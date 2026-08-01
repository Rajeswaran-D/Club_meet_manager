const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function run() {
  try {
    const loginRes = await api.post('/auth/login', {
      email: 'admin1785576740840@clubmeet.com',
      password: 'password123'
    });
    
    let token;
    if (loginRes.data.success) {
      token = loginRes.data.data.token;
    } else {
      token = loginRes.data.token;
    }
    console.log("Token extracted:", token.substring(0, 20) + "...");

    console.log("Fetching /meetings...");
    const meetingRes = await api.get('/meetings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Meetings status:", meetingRes.status);
    
    console.log("Fetching /auth/me...");
    const meRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Auth me status:", meRes.status);
    
  } catch (err) {
    if (err.response) {
      console.error(`API ERROR: ${err.response.status} ${err.config.url}`, err.response.data);
    } else {
      console.error("APP ERROR:", err.message);
    }
  }
}

run();
