const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  
  console.log('========================================');
  console.log('Password:', password);
  console.log('Hashed Password:', hash);
  console.log('========================================');
  console.log('\nCopy this hash for your SQL query:');
  console.log(`'${hash}'`);
  console.log('\nSQL Update Query:');
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 'your-email@example.com';`);
});