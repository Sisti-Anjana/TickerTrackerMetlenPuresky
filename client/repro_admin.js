const axios = require('axios');

async function testAdminLogin() {
    const loginUrl = 'http://localhost:5010/api/auth/admin-login';
    const payload = {
        email: 'admin@system.local',
        password: 'Admin@123'
    };

    console.log(`Attempting login to ${loginUrl}...`);
    console.log('Payload:', payload);

    try {
        const response = await axios.post(loginUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Success:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Body:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testAdminLogin();
