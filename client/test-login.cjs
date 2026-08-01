const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  }
);

async function run() {
  try {
    const response = await api.post('/auth/login', {
      email: 'admin1785576740840@clubmeet.com',
      password: 'password123'
    });
    
    const token = response.data.token;
    const user = response.data.user;
    
    console.log("Token extracted:", token);
    console.log("User extracted:", user);
    
    if (!token) {
      console.log("TOKEN IS UNDEFINED! WHY?");
      console.log("Raw response.data:", response.data);
    }
  } catch (err) {
    console.error("APP ERROR:", err.message);
  }
}

run();
