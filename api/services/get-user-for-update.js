const { pool } = require('../database');
const { userColumns } = require('../helpers');

module.exports = userId => pool.query(`SELECT ${userColumns} FROM users WHERE id = $1`, [userId]);
