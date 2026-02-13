// Removed require node-fetch since it failed. Relying on global fetch.
// So fetch is available (likely Node 18+).

const ADMIN_EMAIL = 'admin@system.local';
const ADMIN_PASSWORD = 'Admin@123';
const API_URL = 'http://localhost:5003/api';

async function verify() {
    try {
        console.log('--- Verifying Admin Access ---');

        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);

        console.log('✅ Login successful. Role:', loginData.user.role);
        const token = loginData.token;

        // 2. Check Client Types Access
        console.log('2. Accessing Client Types...');
        const clientRes = await fetch(`${API_URL}/admin/client-types`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (clientRes.ok) {
            console.log('✅ Success! Client/Site Management is accessible.');
        } else {
            console.error('❌ Failed to access Client/Site Management:', await clientRes.text());
        }

    } catch (err) {
        console.error('Verification failed:', err.message);
    }
}

verify();
