import mysql from 'mysql2/promise';

let pool: mysql.Pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bookstore_db',
    waitForConnections: true,
    connectionLimit: 10,
  });
  console.log('Database pool created successfully');
} catch (error) {
  console.error('Failed to create database pool:', error);
  // Create a dummy pool that won't crash
  pool = {} as mysql.Pool;
}

export default pool;