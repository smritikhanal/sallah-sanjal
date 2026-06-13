require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

if (process.env.DATABASE_URL) {
  // 🔁 Use single URL (recommended for Vercel)
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  // 🔁 Use individual ENV vars
  if (!process.env.DB_HOST) {
    throw new Error("Database configuration missing. Set DB_HOST or DATABASE_URL.");
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    // ⚠️ Important for Railway + Vercel
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

// Export pooled connection for use across the app
module.exports = pool;
