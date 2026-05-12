// db.js
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,        // ✅ Limit connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false } // required for Supabase
});

pool.on("error", (err) => {
  console.error("Unexpected PG Pool error:", err.message);
});

module.exports = pool;
