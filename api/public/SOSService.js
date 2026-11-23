const SOSService = {
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
        return this.apiRequest('/api/admin/sos');
    },

    async update(sosId, status, notes) {
        return this.apiRequest(`/api/admin/sos/${encodeURIComponent(sosId)}`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes }),
        });
    },

    async delete(sosId) {
        return this.apiRequest(`/api/admin/sos/${encodeURIComponent(sosId)}`, {
            method: 'DELETE',
        });
    },
};

window.SOSService = SOSService;
