const bcrypt = require('bcryptjs');

// Use the correct hash
const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const password = 'admin123';

console.log('========================================');
console.log('Testing hash...');
console.log('Hash:', hash);
console.log('Password:', password);

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('');
  console.log('Password matches:', result ? '✅ YES - It works!' : '❌ NO - Wrong hash');
  console.log('========================================');
});