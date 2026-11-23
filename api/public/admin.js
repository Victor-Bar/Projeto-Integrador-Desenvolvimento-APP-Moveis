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
    userForm.elements.address.value = user?.address || '';
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
    const { users } = await window.UsersService.list();
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
        const record = document.createElement('div');
        record.className = 'record';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sos-record';
        const name = request.caller?.username || 'Usuário desconhecido';
        button.textContent = `${formatDate(request.createdAt)} — ${name} — ${request.status || 'Novo'}`;
        button.addEventListener('click', () => openSOSDetails(request));

        const actions = document.createElement('div');
        actions.className = 'record-actions';
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'secondary-button';
        edit.textContent = 'Editar';
        edit.addEventListener('click', () => openSOSDetails(request));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Excluir';
        remove.addEventListener('click', () => deleteSOSRequest(request));
        actions.append(edit, remove);

        record.append(button, actions);
        sosList.appendChild(record);
    });
}

async function loadSOSRequests() {
    const { sosRequests } = await window.SOSService.list();
    renderSOSRequests(sosRequests);
}

function appendPersonField(container, label, value) {
    const field = document.createElement('div');
    field.className = 'sos-person-field';

    const fieldLabel = document.createElement('span');
    fieldLabel.className = 'sos-person-label';
    fieldLabel.textContent = label;

    const fieldValue = document.createElement('p');
    fieldValue.className = 'sos-person-value';
    fieldValue.textContent = value || 'Não informado';

    field.append(fieldLabel, fieldValue);
    container.appendChild(field);
}

function renderSOSContact(contact) {
    const card = document.createElement('article');
    card.className = 'sos-contact-card';

    const name = document.createElement('h4');
    name.className = 'sos-contact-name';
    name.textContent = contact.name || 'Contato sem nome';
    card.appendChild(name);

    const phone = document.createElement('p');
    phone.className = 'sos-contact-detail';
    phone.textContent = contact.phone || 'Telefone não informado';
    card.appendChild(phone);

    if (contact.relationship) {
        const relationship = document.createElement('p');
        relationship.className = 'sos-contact-detail';
        relationship.textContent = contact.relationship;
        card.appendChild(relationship);
    }

    return card;
}

function openSOSDetails(request) {
    sosDetails.replaceChildren();
    const caller = request.caller || {};
    const contacts = Array.isArray(caller.contacts) ? caller.contacts : [];

    const overview = document.createElement('section');
    overview.className = 'sos-overview';

    const overviewHeader = document.createElement('div');
    overviewHeader.className = 'sos-overview-header';
    const timeGroup = document.createElement('div');
    const timeLabel = document.createElement('span');
    timeLabel.className = 'sos-overview-label';
    timeLabel.textContent = 'HORÁRIO DO CHAMADO';
    const time = document.createElement('strong');
    time.className = 'sos-overview-time';
    time.textContent = formatDate(request.createdAt);
    timeGroup.append(timeLabel, time);

    const statusBadge = document.createElement('span');
    statusBadge.className = 'sos-status-badge';
    statusBadge.textContent = request.status || 'Novo';
    overviewHeader.append(timeGroup, statusBadge);
    overview.appendChild(overviewHeader);

    const person = document.createElement('div');
    person.className = 'sos-person-grid';
    appendPersonField(person, 'Nome', caller.username || 'Usuário desconhecido');
    appendPersonField(person, 'E-mail', caller.email);
    appendPersonField(person, 'Endereço', caller.address);
    overview.appendChild(person);
    sosDetails.appendChild(overview);

    const contactsSection = document.createElement('section');
    contactsSection.className = 'sos-contacts-section';
    const contactsHeader = document.createElement('div');
    contactsHeader.className = 'sos-contacts-header';
    const contactsTitle = document.createElement('h3');
    contactsTitle.textContent = 'Contatos';
    const contactsCount = document.createElement('span');
    contactsCount.className = 'sos-contacts-count';
    contactsCount.textContent = `${contacts.length} ${contacts.length === 1 ? 'contato' : 'contatos'}`;
    contactsHeader.append(contactsTitle, contactsCount);

    const contactsList = document.createElement('div');
    contactsList.className = 'sos-contacts-list';
    if (contacts.length) {
        contacts.forEach(contact => contactsList.appendChild(renderSOSContact(contact)));
    } else {
        const empty = document.createElement('p');
        empty.className = 'sos-contacts-empty';
        empty.textContent = 'Nenhum contato cadastrado.';
        contactsList.appendChild(empty);
    }

    contactsSection.append(contactsHeader, contactsList);
    sosDetails.appendChild(contactsSection);

    const form = document.createElement('form');
    form.className = 'sos-status-form';

    const statusLabel = document.createElement('label');
    statusLabel.textContent = 'Status';
    const status = document.createElement('select');
    ['Novo', 'Em atendimento', 'Resolvido'].forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        option.selected = value === (request.status || 'Novo');
        status.appendChild(option);
    });
    statusLabel.appendChild(status);

    const notesLabel = document.createElement('label');
    notesLabel.textContent = 'Observações';
    const notes = document.createElement('textarea');
    notes.value = request.notes || '';
    notesLabel.appendChild(notes);

    const actions = document.createElement('div');
    actions.className = 'sos-actions';
    const save = document.createElement('button');
    save.type = 'submit';
    save.textContent = 'Salvar';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'secondary-button';
    remove.textContent = 'Excluir';
    remove.addEventListener('click', () => deleteSOSRequest(request));
    actions.append(save, remove);

    form.append(statusLabel, notesLabel, actions);
    form.addEventListener('submit', async event => {
        event.preventDefault();
        try {
            await window.SOSService.update(request.id, status.value, notes.value);
            hideModal(sosModal);
            pageMessage.textContent = 'Chamado SOS atualizado.';
            await loadSOSRequests();
        } catch (error) {
            pageMessage.textContent = error.message;
        }
    });

    sosDetails.appendChild(form);
    showModal(sosModal);
}

async function deleteSOSRequest(request) {
    if (!window.confirm('Excluir este chamado SOS?')) return;

    try {
        await window.SOSService.delete(request.id);
        hideModal(sosModal);
        pageMessage.textContent = 'Chamado SOS excluído.';
        await loadSOSRequests();
    } catch (error) {
        pageMessage.textContent = error.message;
    }
}

async function deleteUser(user) {
    if (!window.confirm(`Excluir o usuário ${user.username}?`)) return;

    try {
        await window.UsersService.delete(user.id);
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
        if (isEditing) {
            await window.UsersService.update(userId, values);
        } else {
            await window.UsersService.create(values);
        }
        closeUserModal();
        pageMessage.textContent = isEditing ? 'Usuário atualizado.' : 'Usuário criado.';
        await loadUsers();
    } catch (error) {
        userMessage.textContent = error.message;
    }
});
