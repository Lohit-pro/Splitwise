const { Pool } = require("pg");
require("dotenv").config();

// Create a new pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Executes a query with error handling.
 * @param {string} text - The SQL query string.
 * @param {Array} params - The parameters for the SQL query.
 * @returns {Promise<Object>} - The query result.
 */
async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error("Database query error:", err);
    throw new Error("Database query failed.");
  }
}

/**
 * Begins a new transaction.
 * @returns {Promise<Client>} - The database client used for the transaction.
 */
async function beginTransaction() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    return client;
  } catch (err) {
    console.error("Transaction start error:", err);
    client.release();
    throw new Error("Failed to start transaction.");
  }
}

/**
 * Commits the current transaction.
 * @param {Client} client - The database client used for the transaction.
 * @returns {Promise<void>}
 */
async function commitTransaction(client) {
  try {
    await client.query("COMMIT");
    client.release();
  } catch (err) {
    console.error("Transaction commit error:", err);
    client.release();
    throw new Error("Failed to commit transaction.");
  }
}

/**
 * Rolls back the current transaction.
 * @param {Client} client - The database client used for the transaction.
 * @returns {Promise<void>}
 */
async function rollbackTransaction(client) {
  try {
    await client.query("ROLLBACK");
    client.release();
  } catch (err) {
    console.error("Transaction rollback error:", err);
    client.release();
    throw new Error("Failed to roll back transaction.");
  }
}

/**
 * Closes the database connection pool.
 * @returns {Promise<void>}
 */
async function closePool() {
  try {
    await pool.end();
  } catch (err) {
    console.error("Error closing database pool:", err);
    throw new Error("Failed to close database pool.");
  }
}

module.exports = {
  query,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  closePool,
};
