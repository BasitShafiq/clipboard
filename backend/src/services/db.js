const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err.message);
});


/**
 * Initialize the database schema.
 */
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_active TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✓ PostgreSQL initialized");
  } finally {
    client.release();
  }
}

/**
 * Create a new session row.
 */
async function createSession(id) {
    await pool.query("INSERT INTO sessions (id) VALUES ($1) ON CONFLICT DO NOTHING", [id]);
}

/**
 * Get session by ID.
 */
async function getSession(id) {
  const result = await pool.query("SELECT * FROM sessions WHERE id = $1", [id]);
  return result.rows[0] || null;
}


/**
 * Touch last_active timestamp.
 */
async function touchSession(id) {
  await pool.query("UPDATE sessions SET last_active = NOW() WHERE id = $1", [id]);
}


module.exports = { pool, initDB, createSession, getSession, touchSession };
