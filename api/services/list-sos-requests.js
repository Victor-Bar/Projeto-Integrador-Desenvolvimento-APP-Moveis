const { pool } = require('../database');

module.exports = () => pool.query(
    'SELECT id, user_id, caller, created_at, status, notes, updated_at FROM sos_requests ORDER BY created_at DESC'
);
