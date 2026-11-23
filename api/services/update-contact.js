const { pool } = require('../database');

module.exports = (contact, contactId, userId) => pool.query(
    `UPDATE contacts SET name = $1, phone = $2, relationship = $3
     WHERE id = $4 AND user_id = $5
     RETURNING id, name, phone, relationship`,
    [contact.name, contact.phone, contact.relationship, contactId, userId]
);
