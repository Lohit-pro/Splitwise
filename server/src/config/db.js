const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_user,
    password: String(process.env.DB_password),
    host: "localhost",
    port: 5432,
    database: process.env.DB_name,
});

module.exports = pool;
