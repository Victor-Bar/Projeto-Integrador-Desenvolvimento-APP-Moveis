const crypto = require('node:crypto');
const express = require('express');
const createSosRequest = require('../services/create-sos-request');
const listContactsQuery = require('../services/list-contacts');
const { contactFromRow, userDetails } = require('../helpers');

module.exports = function createSosEndpoints(authenticate) {
    const router = express.Router();

    router.post('/api/sos', authenticate, async (req, res) => {
        const id = crypto.randomUUID();
        const { rows: contactRows } = await listContactsQuery(req.user.id);
        const caller = {
            ...userDetails(req.user),
            contacts: contactRows.map(contactFromRow),
        };
        const { rows } = await createSosRequest(id, req.user.id, caller);
        return res.status(201).json({
            sosRequest: { id: rows[0].id, createdAt: new Date(rows[0].created_at).toISOString() },
        });
    });

    return router;
};
