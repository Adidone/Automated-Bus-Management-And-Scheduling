// db.js
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Supabase
});

pool.on("error", (err) => {
  console.error("Unexpected PG Pool error:", err.message);
});

module.exports = pool;
