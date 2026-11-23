const { pool } = require('../database');

module.exports = sosId => pool.query('DELETE FROM sos_requests WHERE id = $1', [sosId]);
