const http = require('http');

function testLogin() {
    console.log('Testing login on PORT 5003...');

    const postData = JSON.stringify({
        email: 'admin@system.local',
        password: 'admin'
    });

    const options = {
        hostname: 'localhost',
        port: 5003,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('BODY:', data);
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log('✅ Login successful');
            } else {
                console.log('❌ Login failed');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(postData);
    req.end();
}

testLogin();
