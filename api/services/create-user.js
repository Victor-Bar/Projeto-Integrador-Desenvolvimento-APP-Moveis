const { pool } = require('../database');

module.exports = user => pool.query(
    'INSERT INTO users (id, username, email, address, password_hash) VALUES ($1, $2, $3, $4, $5)',
    [user.id, user.username, user.email, user.address, user.passwordHash]
);
