const loginPage = document.getElementById('login-page');
const dashboard = document.getElementById('dashboard');
const pageMessage = document.getElementById('page-message');
const usersList = document.getElementById('users-list');
const sosList = document.getElementById('sos-list');
const userModal = document.getElementById('user-modal');
const userForm = document.getElementById('user-form');
const userMessage = document.getElementById('user-message');
const userModalTitle = document.getElementById('user-modal-title');
const userModalHint = document.getElementById('user-modal-hint');
const saveUserButton = document.getElementById('save-user');
const sosModal = document.getElementById('sos-modal');
const sosDetails = document.getElementById('sos-details');
let editingUserId = null;

async function apiRequest(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    const body = response.status === 204 ? null : await response.json();

    if (!response.ok) {
        throw new Error(body?.error || 'Não foi possível concluir a solicitação.');
    }

    return body;
}

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Data indisponível' : date.toLocaleString('pt-BR');
}

function showModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function hideModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

function openUserModal(user = null) {
    editingUserId = user?.id || null;
    userForm.reset();
    userMessage.textContent = '';
    userModalTitle.textContent = user ? 'Editar usuário' : 'Novo usuário';
    userModalHint.textContent = user
        ? 'Deixe a senha vazia para manter a senha atual.'
        : 'A senha deve ter pelo menos 8 caracteres.';
    saveUserButton.textContent = user ? 'Salvar alterações' : 'Criar usuário';
    userForm.elements.username.value = user?.username || '';
    userForm.elements.email.value = user?.email || '';
    userForm.elements.password.required = !user;
    showModal(userModal);
    userForm.elements.username.focus();
}

function closeUserModal() {
    hideModal(userModal);
    userForm.reset();
    userMessage.textContent = '';
    editingUserId = null;
}

function renderUsers(users) {
    usersList.replaceChildren();

    if (!users.length) {
        const empty = document.createElement('p');
        empty.className = 'empty';
        empty.textContent = 'Nenhum usuário cadastrado.';
        usersList.appendChild(empty);
        return;
    }

    users.forEach(user => {
        const record = document.createElement('div');
        record.className = 'record';

        const copy = document.createElement('div');
        copy.className = 'record-copy';
        const name = document.createElement('strong');
        name.textContent = user.username;
        const email = document.createElement('p');
        email.textContent = user.email;
        copy.append(name, email);

        const actions = document.createElement('div');
        actions.className = 'record-actions';
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'secondary-button';
        edit.textContent = 'Editar';
        edit.addEventListener('click', () => openUserModal(user));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Excluir';
        remove.addEventListener('click', () => deleteUser(user));
        actions.append(edit, remove);
        record.append(copy, actions);
        usersList.appendChild(record);
    });
}

async function loadUsers() {
    const { users } = await apiRequest('/api/users');
    renderUsers(users);
}

function renderSOSRequests(requests) {
    sosList.replaceChildren();
    document.getElementById('sos-count').textContent = String(requests.length);

    if (!requests.length) {
        const empty = document.createElement('p');
        empty.className = 'empty';
        empty.textContent = 'Nenhum chamado SOS recebido.';
        sosList.appendChild(empty);
        return;
    }

    requests.forEach(request => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sos-record';
        const name = request.caller?.username || request.userId || 'Usuário desconhecido';
        button.textContent = `${formatDate(request.createdAt)} — ${name}`;
        button.addEventListener('click', () => openSOSDetails(request));
        sosList.appendChild(button);
    });
}

async function loadSOSRequests() {
    const { sosRequests } = await apiRequest('/api/admin/sos');
    renderSOSRequests(sosRequests);
}

function appendDetails(container, key, value, depth = 0) {
    if (/password|senha|hash/i.test(key)) return;

    const row = document.createElement('div');
    row.className = `detail-row${depth ? ' detail-nested' : ''}`;
    const label = document.createElement('strong');
    label.textContent = key;
    row.appendChild(label);

    if (value && typeof value === 'object') {
        const nested = document.createElement('div');
        const entries = Array.isArray(value)
            ? value.map((item, index) => [String(index + 1), item])
            : Object.entries(value);
        entries.forEach(([childKey, childValue]) => appendDetails(nested, childKey, childValue, depth + 1));
        if (!entries.length) {
            nested.textContent = '—';
        }
        row.appendChild(nested);
    } else {
        const text = document.createElement('span');
        text.textContent = value === null || value === undefined || value === ''
            ? '—'
            : String(value);
        row.appendChild(text);
    }

    container.appendChild(row);
}

function openSOSDetails(request) {
    sosDetails.replaceChildren();
    appendDetails(sosDetails, 'Data e hora do chamado', formatDate(request.createdAt));
    appendDetails(sosDetails, 'Pessoa', request.caller || { id: request.userId });
    showModal(sosModal);
}

async function deleteUser(user) {
    if (!window.confirm(`Excluir o usuário ${user.username}?`)) return;

    try {
        await apiRequest(`/api/users/${encodeURIComponent(user.id)}`, { method: 'DELETE' });
        pageMessage.textContent = 'Usuário excluído.';
        await loadUsers();
    } catch (error) {
        pageMessage.textContent = error.message;
    }
}

async function loadDashboard() {
    pageMessage.textContent = '';
    const results = await Promise.allSettled([loadUsers(), loadSOSRequests()]);
    pageMessage.textContent = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason.message)
        .join(' ');
}

document.getElementById('login-form').addEventListener('submit', event => {
    event.preventDefault();
    event.currentTarget.reset();
    loginPage.hidden = true;
    dashboard.hidden = false;
    loadDashboard();
});

document.getElementById('open-user-modal').addEventListener('click', () => openUserModal());
document.getElementById('close-user-modal').addEventListener('click', closeUserModal);
document.getElementById('close-sos-modal').addEventListener('click', () => hideModal(sosModal));
document.getElementById('refresh').addEventListener('click', loadDashboard);

userModal.addEventListener('click', event => {
    if (event.target === userModal) closeUserModal();
});
sosModal.addEventListener('click', event => {
    if (event.target === sosModal) hideModal(sosModal);
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeUserModal();
        hideModal(sosModal);
    }
});

userForm.addEventListener('submit', async event => {
    event.preventDefault();
    userMessage.textContent = '';
    const values = Object.fromEntries(new FormData(userForm));
    const userId = editingUserId;
    const isEditing = Boolean(userId);
    if (isEditing && !values.password) {
        delete values.password;
    }

    try {
        await apiRequest(
            isEditing ? `/api/users/${encodeURIComponent(userId)}` : '/api/users',
            {
                method: isEditing ? 'PUT' : 'POST',
                body: JSON.stringify(values),
            }
        );
        closeUserModal();
        pageMessage.textContent = isEditing ? 'Usuário atualizado.' : 'Usuário criado.';
        await loadUsers();
    } catch (error) {
        userMessage.textContent = error.message;
    }
});
