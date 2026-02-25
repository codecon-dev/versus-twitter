const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

(async () => {
  try {
    // 1. Login
    const loginRes = await axios.post('http://localhost:3000/auth/login', {
      username: 'testuser_notif',
      password: 'password123'
    });
    const token = loginRes.data.access_token;

    // 2. Create a dummy image
    fs.writeFileSync('dummy.jpg', 'dummy image content');

    // 3. Upload image
    const form = new FormData();
    form.append('file', fs.createReadStream('dummy.jpg'));
    
    // Use the native global fetch or axios
    const uploadRes = await axios.post('http://localhost:3000/upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Upload response:", uploadRes.data);
  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
    } else {
      console.error("Fetch Error:", err.message);
    }
  }
})();
