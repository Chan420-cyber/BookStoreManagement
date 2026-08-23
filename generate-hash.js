const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  console.log('Password:', password);
  console.log('Hashed Password:', hash);
  console.log('');
  console.log('SQL Query:');
  console.log(
    `UPDATE users SET password = '${hash}' WHERE email = 'new_admin@bookstore.com';`
  );
});