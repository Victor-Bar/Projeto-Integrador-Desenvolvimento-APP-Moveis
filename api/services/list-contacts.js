const { pool } = require('../database');

module.exports = userId => pool.query(
    'SELECT id, name, phone, relationship FROM contacts WHERE user_id = $1 ORDER BY created_at, id',
    [userId]
);
