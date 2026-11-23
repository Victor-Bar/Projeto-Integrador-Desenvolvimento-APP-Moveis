const { pool } = require('../database');

module.exports = (id, userId, caller) => pool.query(
    `INSERT INTO sos_requests (id, user_id, caller)
     VALUES ($1, $2, $3)
     RETURNING id, created_at`,
    [id, userId, JSON.stringify(caller)]
);
