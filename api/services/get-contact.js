const { pool } = require('../database');

module.exports = (contactId, userId) => pool.query(
    'SELECT id, name, phone, relationship FROM contacts WHERE id = $1 AND user_id = $2',
    [contactId, userId]
);
