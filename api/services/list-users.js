const { pool } = require('../database');

module.exports = () => pool.query('SELECT id, username, email, address FROM users ORDER BY username');
