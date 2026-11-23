const { pool } = require('../database');

module.exports = (userId, username, email, address, passwordHash) => pool.query(
    `UPDATE users
     SET username = $1, email = $2, address = $3, password_hash = $4
     WHERE id = $5
     RETURNING id, username, email, address`,
    [username, email, address, passwordHash, userId]
);
