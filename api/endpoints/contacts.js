const crypto = require('node:crypto');
const express = require('express');
const createContactQuery = require('../services/create-contact');
const deleteContactQuery = require('../services/delete-contact');
const getContactQuery = require('../services/get-contact');
const listContactsQuery = require('../services/list-contacts');
const updateContactQuery = require('../services/update-contact');
const { contactFromRow, isUuid, normalizeContact } = require('../helpers');

module.exports = function createContactEndpoints(authenticate) {
    const router = express.Router();

    router.get('/api/contacts', authenticate, async (req, res) => {
        const { rows } = await listContactsQuery(req.user.id);
        res.json({ contacts: rows.map(contactFromRow) });
    });

    router.get('/api/contacts/:contactId', authenticate, async (req, res) => {
        const { rows } = isUuid(req.params.contactId)
            ? await getContactQuery(req.params.contactId, req.user.id)
            : { rows: [] };
        const contact = rows[0] ? contactFromRow(rows[0]) : null;
        if (!contact) {
            return res.status(404).json({ error: 'Contato não encontrado.' });
        }

        return res.json({ contact });
    });

    router.post('/api/contacts', authenticate, async (req, res) => {
        const input = normalizeContact(req.body);
        if (!input) {
            return res.status(400).json({ error: 'Os dados do contato são inválidos.' });
        }

        const contact = { id: crypto.randomUUID(), ...input };
        await createContactQuery(contact, req.user.id);
        const { rows } = await listContactsQuery(req.user.id);
        return res.status(201).json({ contact, contacts: rows.map(contactFromRow) });
    });

    router.put('/api/contacts/:contactId', authenticate, async (req, res) => {
        const input = normalizeContact(req.body);
        if (!input) {
            return res.status(400).json({ error: 'Os dados do contato são inválidos.' });
        }

        const result = isUuid(req.params.contactId)
            ? await updateContactQuery(input, req.params.contactId, req.user.id)
            : { rows: [] };
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Contato não encontrado.' });
        }

        const contact = contactFromRow(result.rows[0]);
        const { rows } = await listContactsQuery(req.user.id);
        return res.json({ contact, contacts: rows.map(contactFromRow) });
    });

    router.delete('/api/contacts/:contactId', authenticate, async (req, res) => {
        const result = isUuid(req.params.contactId)
            ? await deleteContactQuery(req.params.contactId, req.user.id)
            : { rowCount: 0 };
        if (!result.rowCount) {
            return res.status(404).json({ error: 'Contato não encontrado.' });
        }

        const { rows } = await listContactsQuery(req.user.id);
        return res.json({ contacts: rows.map(contactFromRow) });
    });

    return router;
};
