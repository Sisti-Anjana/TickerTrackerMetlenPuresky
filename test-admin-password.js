const bcrypt = require('bcryptjs');

// The hash stored in database from VERIFY_USERS_TABLE.sql
const storedHash = '$2a$10$exJmuuR6OrPsVBDF1ZXTO.1QZyIEIkoEv5cbN9XTc7uNAL9HhdJnC';

// Test different passwords
const passwords = ['Admin@123', 'admin123', 'Admin123', 'ADMIN@123'];

console.log('Testing admin password hash...\n');
console.log('Stored Hash:', storedHash);
console.log('\nTesting passwords:');

passwords.forEach(async (password) => {
  const isMatch = await bcrypt.compare(password, storedHash);
  console.log(`Password "${password}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
});

// Wait for all comparisons to complete
setTimeout(() => {
  console.log('\n✅ Test complete');
}, 2000);
