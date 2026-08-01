const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@clubmeet.com',
      password: 'password123'
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error:", err.response?.data || err.message);
  }
})();
