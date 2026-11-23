const { pool } = require('../database');

module.exports = (contact, userId) => pool.query(
    'INSERT INTO contacts (id, user_id, name, phone, relationship) VALUES ($1, $2, $3, $4, $5)',
    [contact.id, userId, contact.name, contact.phone, contact.relationship]
);
