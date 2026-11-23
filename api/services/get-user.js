const { pool } = require('../database');

module.exports = userId => pool.query(
    'SELECT id, username, email, address FROM users WHERE id = $1',
    [userId]
);
