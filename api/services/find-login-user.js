const { pool } = require('../database');
const { userColumns } = require('../helpers');

module.exports = username => pool.query(
    `SELECT ${userColumns} FROM users WHERE LOWER(username) = LOWER($1)`,
    [username]
);
