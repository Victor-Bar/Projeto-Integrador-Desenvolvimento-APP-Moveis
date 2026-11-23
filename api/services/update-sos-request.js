const { pool } = require('../database');

module.exports = (status, notes, sosId) => pool.query(
    `UPDATE sos_requests
     SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
     WHERE id = $3
     RETURNING id, user_id, caller, created_at, status, notes, updated_at`,
    [status, notes, sosId]
);
