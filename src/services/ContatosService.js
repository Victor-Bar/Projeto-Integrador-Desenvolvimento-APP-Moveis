import { request } from './apiClient';

const ContatosService = {
    async list() {
        const response = await request('/api/contacts');
        return response.contacts;
    },

    async get(contactId) {
        const response = await request(`/api/contacts/${encodeURIComponent(contactId)}`);
        return response.contact;
    },

    async create(contact) {
        const response = await request('/api/contacts', {
            method: 'POST',
            body: JSON.stringify(contact),
        });
        return response.contacts;
    },

    async update(contactId, contact) {
        const response = await request(`/api/contacts/${encodeURIComponent(contactId)}`, {
            method: 'PUT',
            body: JSON.stringify(contact),
        });
        return response.contacts;
    },

    async delete(contactId) {
        const response = await request(`/api/contacts/${encodeURIComponent(contactId)}`, {
            method: 'DELETE',
        });
        return response.contacts;
    },
};

export default ContatosService;
