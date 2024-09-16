require('dotenv').config();
// Setup PostgreSQL connection using the Pool from pg
const { Pool } = require('pg');

// Set up the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // PostgreSQL connection URL
  ssl: {
    rejectUnauthorized: false // Required if using a service like Render with SSL enabled
  }
});

// Export the pool object so other files can use it
module.exports = pool;
