const { pool } = require('../database');

module.exports = userId => pool.query('DELETE FROM users WHERE id = $1', [userId]);
