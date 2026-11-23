const { pool } = require('../database');

module.exports = (contactId, userId) => pool.query(
    'DELETE FROM contacts WHERE id = $1 AND user_id = $2',
    [contactId, userId]
);
