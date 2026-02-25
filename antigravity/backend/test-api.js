async function main() {
  try {
    const loginRes = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_notif1',
        password: 'password'
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.access_token;
    console.log("Logged in with token");

    // Check notifications
    console.log("Fetching notifications...");
    const notifRes = await fetch('http://localhost:3000/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Notifications Status:", notifRes.status);
    console.log("Notifications Response:", await notifRes.text());

    // Test upload
    console.log("Testing upload...");
    const formData = new FormData();
    const buffer = Buffer.from('dummy image content');
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('file', blob, 'dummy.jpg');
    
    const uploadRes = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    console.log("Upload Status:", uploadRes.status);
    console.log("Upload Response:", await uploadRes.text());
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
