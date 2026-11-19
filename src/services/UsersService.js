import { getAuthToken, removeAuthToken, request, saveAuthToken } from './apiClient';

const UsersService = {
    async login(username, password) {
        const response = await request('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        await saveAuthToken(response.token);
        return response.user;
    },

    async logout() {
        await removeAuthToken();
    },

    async current() {
        if (!await getAuthToken()) return null;

        try {
            const response = await request('/api/me');
            return response.user;
        } catch (error) {
            if (error.status === 401) {
                await removeAuthToken();
                return null;
            }
            throw error;
        }
    },

    async list() {
        const response = await request('/api/users');
        return response.users;
    },

    async get(userId) {
        const response = await request(`/api/users/${encodeURIComponent(userId)}`);
        return response.user;
    },

    async create(user) {
        const response = await request('/api/users', {
            method: 'POST',
            body: JSON.stringify(user),
        });
        return response.user;
    },

    async update(userId, user) {
        const response = await request(`/api/users/${encodeURIComponent(userId)}`, {
            method: 'PUT',
            body: JSON.stringify(user),
        });
        return response.user;
    },

    async delete(userId) {
        await request(`/api/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
    },
};

export default UsersService;
