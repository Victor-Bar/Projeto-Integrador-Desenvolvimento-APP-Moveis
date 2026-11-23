const express = require('express');
const deleteSosRequest = require('../services/delete-sos-request');
const listSosRequests = require('../services/list-sos-requests');
const updateSosRequest = require('../services/update-sos-request');
const { isUuid, sosRequestFromRow } = require('../helpers');

const router = express.Router();

router.get('/api/admin/sos', async (req, res) => {
    const { rows } = await listSosRequests();
    const sosRequests = rows.map(sosRequestFromRow);
    return res.json({ sosRequests });
});

router.put('/api/admin/sos/:sosId', async (req, res) => {
    const allowedStatuses = ['Novo', 'Em atendimento', 'Resolvido'];
    const status = req.body?.status;
    const notes = req.body?.notes;

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status inválido.' });
    }
    if (notes !== undefined && typeof notes !== 'string') {
        return res.status(400).json({ error: 'As observações são inválidas.' });
    }

    const result = isUuid(req.params.sosId)
        ? await updateSosRequest(status, notes === undefined ? null : notes.trim(), req.params.sosId)
        : { rows: [] };
    if (!result.rows[0]) {
        return res.status(404).json({ error: 'Chamado SOS não encontrado.' });
    }

    return res.json({ sosRequest: sosRequestFromRow(result.rows[0]) });
});

router.delete('/api/admin/sos/:sosId', async (req, res) => {
    const result = isUuid(req.params.sosId)
        ? await deleteSosRequest(req.params.sosId)
        : { rowCount: 0 };
    if (!result.rowCount) {
        return res.status(404).json({ error: 'Chamado SOS não encontrado.' });
    }

    return res.status(204).end();
});

module.exports = router;
