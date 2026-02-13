const http = require('http');

function postRequest(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 5003,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: responseBody }));
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

function putRequest(path, body, token) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 5003,
            path: path,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: responseBody }));
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function run() {
    try {
        console.log('Logging in...');
        const loginRes = await postRequest('/api/auth/login', {
            email: 'admin@system.local',
            password: 'Admin@123'
        });

        if (loginRes.status !== 200) {
            console.error('Login failed:', loginRes.status, loginRes.body);
            return;
        }

        const token = JSON.parse(loginRes.body).token;
        console.log('✅ Got token');

        console.log('Updating ticket 122...');
        const updateRes = await putRequest('/api/tickets/122', {
            ticket_status: 'Open',
            reason: 'Testing from script v2'
        }, token);

        console.log(`Status: ${updateRes.status}`);
        console.log('Body:', updateRes.body);

    } catch (err) {
        console.error('Script error:', err);
    }
}

run();
