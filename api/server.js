const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const app = express();
const port = Number(process.env.PORT || 3000);
const dataFile = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const tokenLifetimeSeconds = 7 * 24 * 60 * 60;

if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET não definido; usando uma chave temporária. Configure-a antes de publicar.');
}

app.use(express.json({ limit: '1mb' }));
app.use('/admin-assets', express.static(path.join(__dirname, 'public')));

function readData() {
    if (!fs.existsSync(dataFile)) {
        return { users: [], sosRequests: [] };
    }

    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    if (!Array.isArray(data.users)) data.users = [];
    if (!Array.isArray(data.sosRequests)) data.sosRequests = [];
    return data;
}

function writeData(data) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

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

function authenticate(req, res, next) {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

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

        const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (!claims.sub || claims.exp <= Math.floor(Date.now() / 1000)) {
            throw new Error('Expired token');
        }

        const { users } = readData();
        req.user = users.find(user => user.id === claims.sub);
        if (!req.user) throw new Error('Unknown user');
        next();
    } catch {
        res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }
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
    .detail-row { padding: 10px 0; border-bottom: 1px solid #eceef1; overflow-wrap: anywhere; }
    .detail-row strong { display: block; margin-bottom: 4px; }
    .detail-nested { padding-left: 16px; }
    .sos-actions { display: flex; gap: 8px; margin-top: 12px; }
    .sos-actions button { flex: 1; }
    .sos-status-form { display: grid; gap: 12px; margin-top: 16px; }
    .sos-status-form select, .sos-status-form textarea { width: 100%; font: inherit; border: 1px solid #dfe2e7; border-radius: 8px; padding: 10px; }
    .sos-status-form textarea { min-height: 90px; resize: vertical; }
    [hidden] { display: none !important; }
    @media (max-width: 720px) { .dashboard { grid-template-columns: 1fr; } }
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

app.get('/api/users', (req, res) => {
    const { users } = readData();
    res.json({ users: users.map(publicUser) });
});

app.get('/api/users/:userId', (req, res) => {
    const { users } = readData();
    const user = users.find(account => account.id === req.params.userId);
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({ user: publicUser(user) });
});

app.post('/api/users', (req, res) => {
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

    const data = readData();
    const duplicate = data.users.some(user =>
        user.username.toLowerCase() === username.toLowerCase() || user.email === email
    );
    if (duplicate) {
        return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.' });
    }

    const user = {
        id: crypto.randomUUID(),
        username,
        email,
        address,
        passwordHash: hashPassword(password),
        contacts: [],
    };
    data.users.push(user);
    writeData(data);
    return res.status(201).json({ user: publicUser(user) });
});

app.put('/api/users/:userId', (req, res) => {
    const input = req.body || {};
    const data = readData();
    const user = data.users.find(account => account.id === req.params.userId);
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

    const duplicate = data.users.some(account =>
        account.id !== user.id &&
        (account.username.toLowerCase() === username.toLowerCase() || account.email === email)
    );
    if (duplicate) {
        return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.' });
    }

    user.username = username;
    user.email = email;
    user.address = address;
    if (password) {
        user.passwordHash = hashPassword(password);
    }
    writeData(data);
    return res.json({ user: publicUser(user) });
});

app.delete('/api/users/:userId', (req, res) => {
    const data = readData();
    const userIndex = data.users.findIndex(account => account.id === req.params.userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    data.users.splice(userIndex, 1);
    writeData(data);
    return res.status(204).end();
});

app.post('/api/login', (req, res) => {
    const input = req.body || {};
    const username = typeof input.username === 'string' ? input.username.trim() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    const { users } = readData();
    const user = users.find(account => account.username.toLowerCase() === username.toLowerCase());

    if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    return res.json({ token: createToken(user), user: publicUser(user) });
});

app.get('/api/me', authenticate, (req, res) => {
    res.json({ user: publicUser(req.user) });
});

app.get('/api/contacts', authenticate, (req, res) => {
    res.json({ contacts: req.user.contacts || [] });
});

app.get('/api/contacts/:contactId', authenticate, (req, res) => {
    const contact = (req.user.contacts || []).find(item => String(item.id) === req.params.contactId);
    if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
    }

    return res.json({ contact });
});

app.post('/api/contacts', authenticate, (req, res) => {
    const input = normalizeContact(req.body);
    if (!input) {
        return res.status(400).json({ error: 'Os dados do contato são inválidos.' });
    }

    const data = readData();
    const user = data.users.find(account => account.id === req.user.id);
    const contact = { id: crypto.randomUUID(), ...input };
    user.contacts = [...(user.contacts || []), contact];
    writeData(data);
    return res.status(201).json({ contact, contacts: user.contacts });
});

app.put('/api/contacts/:contactId', authenticate, (req, res) => {
    const input = normalizeContact(req.body);
    if (!input) {
        return res.status(400).json({ error: 'Os dados do contato são inválidos.' });
    }

    const data = readData();
    const user = data.users.find(account => account.id === req.user.id);
    const contacts = user.contacts || [];
    const index = contacts.findIndex(item => String(item.id) === req.params.contactId);
    if (index === -1) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
    }

    const contact = { ...contacts[index], ...input };
    contacts[index] = contact;
    user.contacts = contacts;
    writeData(data);
    return res.json({ contact, contacts });
});

app.delete('/api/contacts/:contactId', authenticate, (req, res) => {
    const data = readData();
    const user = data.users.find(account => account.id === req.user.id);
    const contacts = user.contacts || [];
    const filteredContacts = contacts.filter(item => String(item.id) !== req.params.contactId);
    if (filteredContacts.length === contacts.length) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
    }

    user.contacts = filteredContacts;
    writeData(data);
    return res.json({ contacts: filteredContacts });
});

app.post('/api/sos', authenticate, (req, res) => {
    const data = readData();
    const user = data.users.find(account => account.id === req.user.id);
    const request = {
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        status: 'Novo',
        notes: '',
        caller: userDetails(user),
    };

    data.sosRequests.push(request);
    writeData(data);
    return res.status(201).json({ sosRequest: { id: request.id, createdAt: request.createdAt } });
});

app.get('/api/admin/sos', (req, res) => {
    const data = readData();
    const sosRequests = data.sosRequests
        .map(request => {
            const user = data.users.find(account => account.id === request.userId);
            return {
                ...request,
                status: request.status || 'Novo',
                notes: request.notes || '',
                caller: userDetails(request.caller || user || {}),
            };
        })
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    return res.json({ sosRequests });
});

app.put('/api/admin/sos/:sosId', (req, res) => {
    const allowedStatuses = ['Novo', 'Em atendimento', 'Resolvido'];
    const status = req.body?.status;
    const notes = req.body?.notes;

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status inválido.' });
    }
    if (notes !== undefined && typeof notes !== 'string') {
        return res.status(400).json({ error: 'As observações são inválidas.' });
    }

    const data = readData();
    const request = data.sosRequests.find(item => item.id === req.params.sosId);
    if (!request) {
        return res.status(404).json({ error: 'Chamado SOS não encontrado.' });
    }

    request.status = status;
    if (notes !== undefined) request.notes = notes.trim();
    request.updatedAt = new Date().toISOString();
    writeData(data);
    return res.json({ sosRequest: request });
});

app.delete('/api/admin/sos/:sosId', (req, res) => {
    const data = readData();
    const requestIndex = data.sosRequests.findIndex(item => item.id === req.params.sosId);
    if (requestIndex === -1) {
        return res.status(404).json({ error: 'Chamado SOS não encontrado.' });
    }

    data.sosRequests.splice(requestIndex, 1);
    writeData(data);
    return res.status(204).end();
});

app.listen(port, '0.0.0.0', () => {
    console.log(`API disponível em http://localhost:${port} (admin: /admin)`);
});
