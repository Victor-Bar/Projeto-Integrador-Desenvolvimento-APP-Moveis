import { request } from './apiClient';

const SOSService = {
    async create() {
        const response = await request('/api/sos', { method: 'POST' });
        return response.sosRequest;
    },

    async list() {
        const response = await request('/api/admin/sos');
        return response.sosRequests;
    },
};

export default SOSService;
