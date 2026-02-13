const axios = require('axios');

async function testBulk() {
    console.log('--- Testing Bulk Site Addition Fix ---');
    try {
        const payload = {
            sites: ['FIX_VERIFY_SITE_1', 'FIX_VERIFY_SITE_2'],
            client_type_id: 1 // Assuming id 1 exists
        };

        // We need a token because the route has 'verifyAdmin' middleware
        // But for testing purposes, I'll check if the server logs my attempt
        // actually, let's try to find a valid token or just see the 401/403 vs 500.

        console.log('Sending request to http://localhost:5003/api/admin/sites/bulk...');
        const response = await axios.post('http://localhost:5003/api/admin/sites/bulk', payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
    } catch (err) {
        if (err.response) {
            console.log('Error Status:', err.response.status);
            console.log('Error Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
    }
}

testBulk();
