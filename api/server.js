const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const tokenLifetimeSeconds = 365 * 24 * 60 * 60;
const { initializeDatabase, pool } = require('./database');
const userColumns = 'id, username, email, address, password_hash AS "passwordHash"';

if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET não definido; usando uma chave temporária. Configure-a antes de publicar.');
}

app.use(express.json({ limit: '1mb' }));
app.use('/admin-assets', express.static(path.join(__dirname, 'public')));

function publicUser(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        address: user.address || '',
    };
}

function userDetails(user) {
    const { password, passwordHash, ...details } = user;
    return details;
}

function contactFromRow(row) {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        relationship: row.relationship,
    };
}

function sosRequestFromRow(row) {
    return {
        id: row.id,
        userId: row.user_id,
        createdAt: new Date(row.created_at).toISOString(),
        status: row.status,
        notes: row.notes,
        ...(row.updated_at ? { updatedAt: new Date(row.updated_at).toISOString() } : {}),
        caller: userDetails(row.caller || {}),
    };
}

function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isUniqueViolation(error) {
    return error.code === '23505';
}

function normalizeContact(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return null;
    }

    return {
        name: typeof input.name === 'string' ? input.name.trim() : '',
        phone: typeof input.phone === 'string' ? input.phone.trim() : '',
        relationship: typeof input.relationship === 'string' ? input.relationship.trim() : '',
    };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
    const [salt, savedHash] = passwordHash.split(':');
    const candidate = Buffer.from(hashPassword(password, salt).split(':')[1], 'hex');
    const expected = Buffer.from(savedHash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function createToken(user) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + tokenLifetimeSeconds,
    })).toString('base64url');
    const signature = crypto
        .createHmac('sha256', jwtSecret)
        .update(`${header}.${payload}`)
        .digest('base64url');
    return `${header}.${payload}.${signature}`;
}

async function authenticate(req, res, next) {
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

    const { rows } = await pool.query(`SELECT ${userColumns} FROM users WHERE id = $1`, [claims.sub]);
    if (!rows[0]) {
        return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    req.user = rows[0];
    return next();
}

app.get('/', (req, res) => res.redirect('/admin'));

app.get('/admin', (req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Administração - Projeto Integrador</title>
  <style>
    * { box-sizing: border-box; }
    body { font: 16px system-ui, sans-serif; margin: 0; padding: 32px 20px; color: #20242b; background: #f3f4f6; }
    main { width: min(100%, 1120px); margin: 0 auto; padding: 24px; border-radius: 16px; background: white; }
    h1, h2, p { margin-top: 0; }
    button { font: inherit; padding: 10px 14px; border: 0; border-radius: 8px; color: white; background: #d62828; cursor: pointer; }
    button:disabled { opacity: .6; cursor: wait; }
    .secondary-button { color: #454a54; background: #f3f4f6; }
    .login-card { max-width: 440px; margin-top: 10vh; }
    .form { display: grid; gap: 12px; }
    input { width: 100%; padding: 12px; border: 1px solid #dfe2e7; border-radius: 8px; font: inherit; }
    .notice { color: #737985; font-size: 14px; }
    .error { color: #b42318; min-height: 1.5em; }
    .dashboard-header, .section-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .panel { min-width: 0; padding: 18px; border: 1px solid #eceef1; border-radius: 12px; }
    .record { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid #eceef1; }
    .record:last-child { border-bottom: 0; }
    .record-copy { min-width: 0; overflow-wrap: anywhere; }
    .record-copy p { margin: 4px 0 0; color: #737985; font-size: 14px; }
    .record-actions { display: flex; flex: 0 0 auto; gap: 8px; }
    .record-actions button { padding: 7px 10px; }
    .sos-record { width: 100%; color: #20242b; text-align: left; background: white; border-bottom: 1px solid #eceef1; border-radius: 0; }
    .empty { color: #737985; padding: 18px 0; }
    .modal { position: fixed; inset: 0; z-index: 1; display: none; place-items: center; overflow: auto; padding: 20px; background: rgba(32, 36, 43, .5); }
    .modal.open { display: grid; }
    .modal-card { width: min(100%, 560px); max-height: 90vh; overflow: auto; padding: 24px; border-radius: 16px; background: white; box-shadow: 0 16px 48px rgba(0, 0, 0, .2); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .sos-overview { padding: 16px; border: 1px solid #eceef1; border-radius: 12px; background: #fafafa; }
    .sos-overview-header, .sos-contacts-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .sos-overview-label, .sos-person-label { color: #737985; font-size: 12px; font-weight: 600; }
    .sos-overview-time { display: block; margin-top: 5px; color: #20242b; font-size: 18px; }
    .sos-status-badge { flex: 0 0 auto; padding: 6px 10px; border-radius: 999px; color: #a32121; background: #fce8e8; font-size: 12px; font-weight: 700; }
    .sos-person-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
    .sos-person-field { min-width: 0; padding: 11px 12px; border: 1px solid #eceef1; border-radius: 10px; background: white; }
    .sos-person-value { margin: 5px 0 0; color: #20242b; font-weight: 600; overflow-wrap: anywhere; }
    .sos-contacts-section { margin-top: 16px; }
    .sos-contacts-header { margin-bottom: 10px; }
    .sos-contacts-header h3 { margin: 0; font-size: 16px; }
    .sos-contacts-count { color: #737985; font-size: 13px; }
    .sos-contacts-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 220px; overflow-y: auto; overscroll-behavior: contain; padding: 2px 6px 2px 2px; }
    .sos-contact-card { min-width: 0; padding: 12px; border: 1px solid #eceef1; border-radius: 10px; background: white; }
    .sos-contact-name { margin: 0; color: #20242b; font-size: 14px; }
    .sos-contact-detail { margin: 6px 0 0; color: #737985; font-size: 13px; overflow-wrap: anywhere; }
    .sos-contacts-empty { grid-column: 1 / -1; margin: 0; padding: 14px; border: 1px dashed #dfe2e7; border-radius: 10px; color: #737985; text-align: center; }
    .sos-actions { display: flex; gap: 8px; margin-top: 12px; }
    .sos-actions button { flex: 1; }
    .sos-status-form { display: grid; gap: 12px; margin-top: 16px; }
    .sos-status-form select, .sos-status-form textarea { width: 100%; font: inherit; border: 1px solid #dfe2e7; border-radius: 8px; padding: 10px; }
    .sos-status-form textarea { min-height: 90px; resize: vertical; }
    [hidden] { display: none !important; }
    @media (max-width: 720px) { .dashboard { grid-template-columns: 1fr; } }
    @media (max-width: 480px) { .sos-person-grid, .sos-contacts-list { grid-template-columns: 1fr; } }
    @media (max-width: 480px) { body { padding: 16px 10px; } main { padding: 18px; } .record { align-items: flex-start; flex-direction: column; } }
  </style>
</head>
<body>
  <main class="login-card" id="login-page">
    <h1>Entrar no painel</h1>
    <p class="notice">Tela demonstrativa. O login não é validado nem protege as rotas da API.</p>
    <form class="form" id="login-form">
      <input name="username" placeholder="Usuário" autocomplete="username" required>
      <input name="password" type="password" placeholder="Senha" autocomplete="current-password" required>
      <button type="submit">Entrar</button>
    </form>
  </main>
  <main id="dashboard" hidden>
    <div class="dashboard-header">
      <div>
        <h1>Painel administrativo</h1>
        <p class="notice">Acesso demonstrativo; este painel não realiza autenticação.</p>
      </div>
      <button type="button" class="secondary-button" id="refresh">Atualizar</button>
    </div>
    <p class="error" id="page-message" role="status"></p>
    <div class="dashboard">
      <section class="panel">
        <div class="section-header">
          <h2>Usuários</h2>
          <button type="button" id="open-user-modal">Adicionar</button>
        </div>
        <div id="users-list"></div>
      </section>
      <section class="panel">
        <div class="section-header">
          <h2>Chamados SOS</h2>
          <span id="sos-count" class="notice"></span>
        </div>
        <div id="sos-list"></div>
      </section>
    </div>
  </main>
  <div class="modal" id="user-modal" aria-hidden="true">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
      <h2 id="user-modal-title">Novo usuário</h2>
      <form class="form" id="user-form">
        <input name="username" placeholder="Usuário" autocomplete="username" required>
        <input name="email" type="email" placeholder="E-mail" autocomplete="email" required>
        <input name="address" placeholder="Endereço" autocomplete="street-address">
        <input name="password" type="password" placeholder="Senha (mínimo 8 caracteres)" minlength="8" autocomplete="new-password">
        <p class="notice" id="user-modal-hint"></p>
        <p class="error" id="user-message" role="status"></p>
        <div class="modal-actions">
          <button type="button" class="secondary-button" id="close-user-modal">Cancelar</button>
          <button type="submit" id="save-user">Criar usuário</button>
        </div>
      </form>
    </section>
  </div>
  <div class="modal" id="sos-modal" aria-hidden="true">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="sos-modal-title">
      <h2 id="sos-modal-title">Dados do chamado</h2>
      <div id="sos-details"></div>
      <div class="modal-actions">
        <button type="button" id="close-sos-modal">Fechar</button>
      </div>
    </section>
  </div>
  <script src="/admin-assets/admin.js" defer></script>
</body>
</html>`);
});

app.get('/api/users', async (req, res) => {
    const { rows } = await pool.query('SELECT id, username, email, address FROM users ORDER BY username');
    res.json({ users: rows.map(publicUser) });
});

app.get('/api/users/:userId', async (req, res) => {
    const { rows } = isUuid(req.params.userId)
        ? await pool.query('SELECT id, username, email, address FROM users WHERE id = $1', [req.params.userId])
        : { rows: [] };
    const user = rows[0];
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({ user: publicUser(user) });
});

app.post('/api/users', async (req, res) => {
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
        await pool.query(
            'INSERT INTO users (id, username, email, address, password_hash) VALUES ($1, $2, $3, $4, $5)',
            [user.id, user.username, user.email, user.address, user.passwordHash]
        );
    } catch (error) {
        if (isUniqueViolation(error)) {
            return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.' });
        }
        throw error;
    }
    return res.status(201).json({ user: publicUser(user) });
});

app.put('/api/users/:userId', async (req, res) => {
    const input = req.body || {};
    const { rows } = isUuid(req.params.userId)
        ? await pool.query(`SELECT ${userColumns} FROM users WHERE id = $1`, [req.params.userId])
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
        const result = await pool.query(
            `UPDATE users
             SET username = $1, email = $2, address = $3, password_hash = $4
             WHERE id = $5
             RETURNING id, username, email, address`,
            [username, email, address, passwordHash, user.id]
        );
        return res.json({ user: publicUser(result.rows[0]) });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.' });
        }
        throw error;
    }
});

app.delete('/api/users/:userId', async (req, res) => {
    const result = isUuid(req.params.userId)
        ? await pool.query('DELETE FROM users WHERE id = $1', [req.params.userId])
        : { rowCount: 0 };
    if (!result.rowCount) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.status(204).end();
});

app.post('/api/login', async (req, res) => {
    const input = req.body || {};
    const username = typeof input.username === 'string' ? input.username.trim() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    const { rows } = await pool.query(
        `SELECT ${userColumns} FROM users WHERE LOWER(username) = LOWER($1)`,
        [username]
    );
    const user = rows[0];

    if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    return res.json({ token: createToken(user), user: publicUser(user) });
});

app.get('/api/me', authenticate, (req, res) => {
    res.json({ user: publicUser(req.user) });
});

app.get('/api/contacts', authenticate, async (req, res) => {
    const { rows } = await pool.query(
        'SELECT id, name, phone, relationship FROM contacts WHERE user_id = $1 ORDER BY created_at, id',
        [req.user.id]
    );
    res.json({ contacts: rows.map(contactFromRow) });
});

app.get('/api/contacts/:contactId', authenticate, async (req, res) => {
    const { rows } = isUuid(req.params.contactId)
        ? await pool.query(
            'SELECT id, name, phone, relationship FROM contacts WHERE id = $1 AND user_id = $2',
            [req.params.contactId, req.user.id]
        )
        : { rows: [] };
    const contact = rows[0] ? contactFromRow(rows[0]) : null;
    if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
    }

    return res.json({ contact });
});

app.post('/api/contacts', authenticate, async (req, res) => {
    const input = normalizeContact(req.body);
    if (!input) {
        return res.status(400).json({ error: 'Os dados do contato são inválidos.' });
    }

    const contact = { id: crypto.randomUUID(), ...input };
    await pool.query(
        'INSERT INTO contacts (id, user_id, name, phone, relationship) VALUES ($1, $2, $3, $4, $5)',
        [contact.id, req.user.id, contact.name, contact.phone, contact.relationship]
    );
    const { rows } = await pool.query(
        'SELECT id, name, phone, relationship FROM contacts WHERE user_id = $1 ORDER BY created_at, id',
        [req.user.id]
    );
    return res.status(201).json({ contact, contacts: rows.map(contactFromRow) });
});

app.put('/api/contacts/:contactId', authenticate, async (req, res) => {
    const input = normalizeContact(req.body);
    if (!input) {
        return res.status(400).json({ error: 'Os dados do contato são inválidos.' });
    }

    const result = isUuid(req.params.contactId)
        ? await pool.query(
            `UPDATE contacts SET name = $1, phone = $2, relationship = $3
             WHERE id = $4 AND user_id = $5
             RETURNING id, name, phone, relationship`,
            [input.name, input.phone, input.relationship, req.params.contactId, req.user.id]
        )
        : { rows: [] };
    if (!result.rows[0]) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
    }

    const contact = contactFromRow(result.rows[0]);
    const { rows } = await pool.query(
        'SELECT id, name, phone, relationship FROM contacts WHERE user_id = $1 ORDER BY created_at, id',
        [req.user.id]
    );
    const contacts = rows.map(contactFromRow);
    return res.json({ contact, contacts });
});

app.delete('/api/contacts/:contactId', authenticate, async (req, res) => {
    const result = isUuid(req.params.contactId)
        ? await pool.query('DELETE FROM contacts WHERE id = $1 AND user_id = $2', [req.params.contactId, req.user.id])
        : { rowCount: 0 };
    if (!result.rowCount) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
    }

    const { rows } = await pool.query(
        'SELECT id, name, phone, relationship FROM contacts WHERE user_id = $1 ORDER BY created_at, id',
        [req.user.id]
    );
    const filteredContacts = rows.map(contactFromRow);
    return res.json({ contacts: filteredContacts });
});

app.post('/api/sos', authenticate, async (req, res) => {
    const id = crypto.randomUUID();
    const { rows: contactRows } = await pool.query(
        'SELECT id, name, phone, relationship FROM contacts WHERE user_id = $1 ORDER BY created_at, id',
        [req.user.id]
    );
    const caller = {
        ...userDetails(req.user),
        contacts: contactRows.map(contactFromRow),
    };
    const { rows } = await pool.query(
        `INSERT INTO sos_requests (id, user_id, caller)
         VALUES ($1, $2, $3)
         RETURNING id, created_at`,
        [id, req.user.id, JSON.stringify(caller)]
    );
    return res.status(201).json({
        sosRequest: { id: rows[0].id, createdAt: new Date(rows[0].created_at).toISOString() },
    });
});

app.get('/api/admin/sos', async (req, res) => {
    const { rows } = await pool.query(
        'SELECT id, user_id, caller, created_at, status, notes, updated_at FROM sos_requests ORDER BY created_at DESC'
    );
    const sosRequests = rows.map(sosRequestFromRow);
    return res.json({ sosRequests });
});

app.put('/api/admin/sos/:sosId', async (req, res) => {
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
        ? await pool.query(
            `UPDATE sos_requests
             SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
             WHERE id = $3
             RETURNING id, user_id, caller, created_at, status, notes, updated_at`,
            [status, notes === undefined ? null : notes.trim(), req.params.sosId]
        )
        : { rows: [] };
    if (!result.rows[0]) {
        return res.status(404).json({ error: 'Chamado SOS não encontrado.' });
    }

    return res.json({ sosRequest: sosRequestFromRow(result.rows[0]) });
});

app.delete('/api/admin/sos/:sosId', async (req, res) => {
    const result = isUuid(req.params.sosId)
        ? await pool.query('DELETE FROM sos_requests WHERE id = $1', [req.params.sosId])
        : { rowCount: 0 };
    if (!result.rowCount) {
        return res.status(404).json({ error: 'Chamado SOS não encontrado.' });
    }

    return res.status(204).end();
});

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
