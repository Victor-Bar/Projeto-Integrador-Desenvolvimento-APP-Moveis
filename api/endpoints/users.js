const crypto = require('node:crypto');
const express = require('express');
const createUserQuery = require('../services/create-user');
const deleteUserQuery = require('../services/delete-user');
const getUserQuery = require('../services/get-user');
const getUserForUpdateQuery = require('../services/get-user-for-update');
const listUsersQuery = require('../services/list-users');
const updateUserQuery = require('../services/update-user');
const { hashPassword, isUniqueViolation, isUuid, publicUser } = require('../helpers');

const router = express.Router();

router.get('/api/users', async (req, res) => {
    const { rows } = await listUsersQuery();
    res.json({ users: rows.map(publicUser) });
});

router.get('/api/users/:userId', async (req, res) => {
    const { rows } = isUuid(req.params.userId)
        ? await getUserQuery(req.params.userId)
        : { rows: [] };
    const user = rows[0];
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({ user: publicUser(user) });
});

router.post('/api/users', async (req, res) => {
    const input = req.body || {};
    const username = typeof input.username === 'string' ? input.username.trim() : '';
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    const address = typeof input.address === 'string' ? input.address.trim() : '';

    if (input.address !== undefined && typeof input.address !== 'string') {
        return res.status(400).json({ error: 'O endereço informado é inválido.' });
    }

    if (username.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
        return res.status(400).json({ error: 'Informe usuário (mínimo 3 caracteres), e-mail válido e senha (mínimo 8 caracteres).' });
    }

    const user = {
        id: crypto.randomUUID(),
        username,
        email,
        address,
        passwordHash: hashPassword(password),
    };
    try {
        await createUserQuery(user);
    } catch (error) {
        if (isUniqueViolation(error)) {
            return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.' });
        }
        throw error;
    }
    return res.status(201).json({ user: publicUser(user) });
});

router.put('/api/users/:userId', async (req, res) => {
    const input = req.body || {};
    const { rows } = isUuid(req.params.userId)
        ? await getUserForUpdateQuery(req.params.userId)
        : { rows: [] };
    const user = rows[0];
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (
        (input.username !== undefined && typeof input.username !== 'string') ||
        (input.email !== undefined && typeof input.email !== 'string') ||
        (input.password !== undefined && typeof input.password !== 'string') ||
        (input.address !== undefined && typeof input.address !== 'string')
    ) {
        return res.status(400).json({ error: 'Os dados do usuário são inválidos.' });
    }

    const username = input.username === undefined ? user.username : input.username.trim();
    const email = input.email === undefined ? user.email : input.email.trim().toLowerCase();
    const address = input.address === undefined ? (user.address || '') : input.address.trim();
    const password = input.password || '';
    if (
        username.length < 3 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        (password.length > 0 && password.length < 8)
    ) {
        return res.status(400).json({ error: 'Informe usuário (mínimo 3 caracteres), e-mail válido e senha (mínimo 8 caracteres).' });
    }

    const passwordHash = password ? hashPassword(password) : user.passwordHash;
    try {
        const result = await updateUserQuery(user.id, username, email, address, passwordHash);
        return res.json({ user: publicUser(result.rows[0]) });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.' });
        }
        throw error;
    }
});

router.delete('/api/users/:userId', async (req, res) => {
    const result = isUuid(req.params.userId)
        ? await deleteUserQuery(req.params.userId)
        : { rowCount: 0 };
    if (!result.rowCount) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.status(204).end();
});

module.exports = router;
