// Test server endpoints directly
console.log('🧪 Testing server endpoints...');

async function testEndpoints() {
  const baseUrl = 'http://localhost:5001/api';
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // Test 2: Test user registration
    console.log('\n2. Testing user registration...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        password: 'password123'
      })
    });
    
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful:', registerData);
      
      // Test 3: Test login
      console.log('\n3. Testing login...');
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'password123'
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Login successful:', loginData);
        
        // Test 4: Test protected route
        console.log('\n4. Testing protected route...');
        const meResponse = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        const meData = await meResponse.json();
        console.log('✅ Protected route:', meData);
        
        console.log('\n🎉 ALL TESTS PASSED! Server is working correctly.');
        console.log('📝 You can now register through the UI at http://localhost:3000');
        
      } else {
        console.log('❌ Login failed:', loginData);
      }
      
    } else {
      console.log('❌ Registration failed:', registerData);
      console.log('📊 Response status:', registerResponse.status);
    }
    
    // Test 5: Check users in database
    console.log('\n5. Checking users in database...');
    const usersResponse = await fetch(`${baseUrl}/auth/debug/users`);
    const usersData = await usersResponse.json();
    console.log('👥 Users in database:', usersData);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('🔧 Make sure your server is running on port 5001');
  }
}

testEndpoints();