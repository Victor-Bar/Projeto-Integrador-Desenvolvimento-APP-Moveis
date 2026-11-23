const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const { initializeDatabase, pool } = require('./database');
const createAuthenticate = require('./authentication');
const authenticate = createAuthenticate(jwtSecret);

if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET não definido; usando uma chave temporária. Configure-a antes de publicar.');
}

app.use(express.json({ limit: '1mb' }));
app.use('/admin-assets', express.static(path.join(__dirname, 'public')));
app.use(require('./endpoints/site'));
app.use(require('./endpoints/users'));
app.use(require('./endpoints/auth')({ jwtSecret, authenticate }));
app.use(require('./endpoints/contacts')(authenticate));
app.use(require('./endpoints/sos')(authenticate));
app.use(require('./endpoints/admin-sos'));

app.use((error, req, res, next) => {
    console.error('Erro ao processar requisição:', error);
    if (res.headersSent) {
        return next(error);
    }
    return res.status(500).json({ error: 'Erro interno do servidor.' });
});

async function start() {
    await initializeDatabase();
    app.listen(port, '0.0.0.0', () => {
        console.log(`API disponível em http://localhost:${port} (admin: /admin)`);
    });
}

start().catch(async error => {
    console.error('Não foi possível iniciar a API:', error);
    await pool.end();
    process.exitCode = 1;
});
