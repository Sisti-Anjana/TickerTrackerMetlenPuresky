const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'https://5360dbaf0288.ngrok-free.app/api';

async function testEndpoints() {
  console.log('🧪 Testing Backend Endpoints...\n');

  // Test 1: Check if server is running
  console.log('📡 Test 1: Server Health Check');
  try {
    const response = await fetch(`${API_URL}/auth/test`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is running');
      console.log('   Response:', data);
    } else {
      console.log('❌ Server responded with error:', response.status);
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('   Make sure to start the server with: npm start');
    console.log('   Error:', error.message);
    return;
  }

  console.log('\n');

  // Test 2: Admin Login
  console.log('🔐 Test 2: Admin Login');
  try {
    const response = await fetch(`${API_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        email: 'admin@system.local',
        password: 'Admin@123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin login successful');
      console.log('   User:', data.user.name);
      console.log('   Role:', data.user.role);
      console.log('   Token:', data.token ? 'Generated ✓' : 'Not generated ✗');
    } else {
      const error = await response.json();
      console.log('❌ Admin login failed');
      console.log('   Error:', error.message);
    }
  } catch (error) {
    console.log('❌ Admin login request failed');
    console.log('   Error:', error.message);
  }

  console.log('\n');

  // Test 3: List all users
  console.log('👥 Test 3: List All Users');
  try {
    const response = await fetch(`${API_URL}/auth/debug/users`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Found ${data.count} users:`);
      data.users.slice(0, 5).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
      if (data.count > 5) {
        console.log(`   ... and ${data.count - 5} more users`);
      }
    } else {
      console.log('❌ Failed to fetch users');
    }
  } catch (error) {
    console.log('❌ User list request failed');
    console.log('   Error:', error.message);
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ ENDPOINT TESTING COMPLETE!');
  console.log('═══════════════════════════════════════════════════════');
}

// Run tests
testEndpoints().catch(console.error);
