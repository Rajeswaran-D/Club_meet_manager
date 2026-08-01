const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    console.log("INTERCEPTOR INPUT:", response.data);
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    console.log("INTERCEPTOR OUTPUT:", response.data);
    return response;
  }
);

async function run() {
  try {
    const response = await api.post('/auth/login', {
      email: 'admin1785576740840@clubmeet.com',
      password: 'password123'
    });
    console.log("APP RECEIVED DATA:", response.data);
    console.log("APP EXTRACTED TOKEN:", response.data.token);
  } catch (err) {
    console.error("APP ERROR:", err.message);
  }
}

run();
