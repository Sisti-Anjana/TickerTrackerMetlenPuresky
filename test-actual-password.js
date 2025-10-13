const bcrypt = require('bcryptjs');

// The ACTUAL hash from the database
const actualHash = '$2a$10$rB7VWFJWZZfO9X8YrGBiJOKr7UQT.L2ZJ4LxY0hLZvZLHKY8LZ0UG';

// Test different passwords
const passwords = [
  'Admin@123',
  'admin123', 
  'Admin123',
  'admin',
  'password',
  'test123',
  'Test@123'
];

console.log('Testing ACTUAL database password hash...\n');
console.log('Actual Hash:', actualHash);
console.log('\nTesting passwords:');

async function testPasswords() {
  for (const password of passwords) {
    const isMatch = await bcrypt.compare(password, actualHash);
    console.log(`Password "${password}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
  }
  console.log('\n✅ Test complete');
}

testPasswords();
