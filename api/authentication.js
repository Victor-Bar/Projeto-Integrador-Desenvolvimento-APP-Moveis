const crypto = require('node:crypto');
const getAuthenticatedUser = require('./services/get-authenticated-user');

function createAuthenticate(jwtSecret) {
    return async function authenticate(req, res, next) {
        const authorization = req.headers.authorization || '';
        const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
        let claims;

        try {
            const [header, payload, signature] = token.split('.');
            if (!header || !payload || !signature) throw new Error('Invalid token');

            const expected = crypto
                .createHmac('sha256', jwtSecret)
                .update(`${header}.${payload}`)
                .digest();
            const received = Buffer.from(signature, 'base64url');
            if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
                throw new Error('Invalid token signature');
            }

            claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
            if (
                !claims ||
                typeof claims.sub !== 'string' ||
                typeof claims.exp !== 'number' ||
                claims.exp <= Math.floor(Date.now() / 1000)
            ) {
                throw new Error('Expired token');
            }
        } catch {
            return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
        }

        const { rows } = await getAuthenticatedUser(claims.sub);
        if (!rows[0]) {
            return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
        }

        req.user = rows[0];
        return next();
    };
}

module.exports = createAuthenticate;
