const axios = require('axios');

async function repro() {
    const API_URL = 'http://localhost:5003/api';
    console.log('--- Attempting Admin Login ---');

    try {
        const loginRes = await axios.post(`${API_URL}/auth/admin-login`, {
            email: 'admin@system.local',
            password: 'admin' // I hope this is the password
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful. Token obtained.');

        console.log('--- Attempting to Fetch User 9 ---');
        const fetchRes = await axios.get(`${API_URL}/admin/users/9`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Fetch SUCCESS:', fetchRes.data);
    } catch (error) {
        console.error('❌ Error caught:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

repro();
