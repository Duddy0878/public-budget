const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 23758,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Duddy@0878',
  database: process.env.DB_NAME || 'my_budget',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false, // Allow self-signed certs from Aiven
    minVersion: 'TLSv1.2'
  }
});

// Test the connection and log details
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    console.log('Connection config used:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL,
      // Not logging password for security
    });
  } else {
    console.log('Database connected successfully');
    connection.release();
  }
});

const promisePool = pool.promise();

// Add error handler for the promise pool
promisePool.on('error', err => {
  console.error('Database pool error:', err);
});

module.exports = promisePool;
