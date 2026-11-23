const express = require('express');
const findLoginUser = require('../services/find-login-user');
const { createToken, publicUser, verifyPassword } = require('../helpers');

module.exports = function createAuthEndpoints({ jwtSecret, authenticate }) {
    const router = express.Router();

    router.post('/api/login', async (req, res) => {
        const input = req.body || {};
        const username = typeof input.username === 'string' ? input.username.trim() : '';
        const password = typeof input.password === 'string' ? input.password : '';
        const { rows } = await findLoginUser(username);
        const user = rows[0];

        if (!user || !verifyPassword(password, user.passwordHash)) {
            return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }

        return res.json({ token: createToken(user, jwtSecret), user: publicUser(user) });
    });

    router.get('/api/me', authenticate, (req, res) => {
        res.json({ user: publicUser(req.user) });
    });

    return router;
};
