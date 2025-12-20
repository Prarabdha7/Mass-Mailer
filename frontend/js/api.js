const API = {
    BASE_URL: '/api',

    _getHeaders() {
        const session = Auth.getSession();
        const headers = { 'Content-Type': 'application/json' };
        if (session && session.token) {
            headers['Authorization'] = `Bearer ${session.token}`;
        }
        return headers;
    },

    async _request(method, endpoint, body = null) {
        const options = {
            method,
            headers: this._getHeaders()
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${this.BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || error.message || 'Request failed');
        }
        return response.json();
    },

    async validateEmails(emails) {
        return this._request('POST', '/validate-emails', { emails });
    },

    async configureSMTP(config) {
        return this._request('POST', '/configure-smtp', config);
    },

    async sendCampaign(data) {
        return this._request('POST', '/send-campaign', data);
    },

    async getCampaignStatus(id) {
        return this._request('GET', `/campaign-status/${id}`);
    },

    async getDeliveryReport(id) {
        return this._request('GET', `/delivery-report/${id}`);
    },

    downloadReportCSV(id) {
        const session = Auth.getSession();
        const url = `${this.BASE_URL}/delivery-report/${id}/csv`;
        const link = document.createElement('a');
        link.href = url;
        link.download = `delivery-report-${id}.csv`;
        if (session && session.token) {
            fetch(url, { headers: this._getHeaders() })
                .then(response => response.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    link.href = blobUrl;
                    link.click();
                    URL.revokeObjectURL(blobUrl);
                });
        } else {
            link.click();
        }
    }
};
