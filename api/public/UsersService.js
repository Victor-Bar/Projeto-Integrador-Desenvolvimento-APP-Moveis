const UsersService = {
    async apiRequest(path, options = {}) {
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
    },

    async list() {
        return this.apiRequest('/api/users');
    },

    async create(user) {
        return this.apiRequest('/api/users', {
            method: 'POST',
            body: JSON.stringify(user),
        });
    },

    async update(userId, user) {
        return this.apiRequest(`/api/users/${encodeURIComponent(userId)}`, {
            method: 'PUT',
            body: JSON.stringify(user),
        });
    },

    async delete(userId) {
        return this.apiRequest(`/api/users/${encodeURIComponent(userId)}`, {
            method: 'DELETE',
        });
    },
};

window.UsersService = UsersService;
