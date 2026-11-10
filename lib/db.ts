// import mysql from 'mysql2/promise';

// // Create connection pool
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   port: parseInt(process.env.DB_PORT || '3306'),
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'bookstore_db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 0
// });

// // Test connection on startup
// async function testConnection() {
//   try {
//     const connection = await pool.getConnection();
//     console.log('✅ Database connected successfully!');
//     connection.release();
//   } catch (error) {
//     console.error('❌ Database connection failed:', error);
//   }
// }

// testConnection();

// export default pool;

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: '4GtQupPXJM4bn3J.root',
  password: 'GUtAm2uawx1wHAeW',
  database: process.env.TIDB_DATABASE || 'bookstore_db',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;