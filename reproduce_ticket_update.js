const fetch = require('node-fetch');

async function testUpdate() {
    const ticketId = 122;
    console.log(`Testing UPDATE on ticket ${ticketId}...`);

    try {
        // 1. Login to get token
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5003/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@system.local', password: 'Admin@123' })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Got token');

        // 2. Update ticket
        console.log('Updating ticket...');
        const response = await fetch(`http://localhost:5003/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ticket_status: 'On Hold', // Changed status to trigger history
                reason: 'Testing update from script with real token'
            })
        });

        const status = response.status;
        console.log(`Status: ${status}`);

        const text = await response.text();
        console.log('Body:', text);

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testUpdate();
