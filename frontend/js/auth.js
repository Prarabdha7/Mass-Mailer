const Auth = {
    STORAGE_KEY: 'admin_session',
    API_BASE: '/api/auth',

    async loginWithToken(accessToken) {
        try {
            const response = await fetch(`${this.API_BASE}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: accessToken })
            });
            const data = await response.json();
            if (data.success && data.session_token) {
                this._storeSession(data.session_token);
                return { success: true };
            }
            return { success: false, error: data.error || 'Token login failed' };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    },

    async validateSession() {
        const session = this.getSession();
        if (!session || !session.token) {
            return false;
        }
        try {
            const response = await fetch(`${this.API_BASE}/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_token: session.token })
            });
            const data = await response.json();
            if (data.valid) {
                return true;
            }
            this._clearSession();
            return false;
        } catch (error) {
            return false;
        }
    },

    async logout() {
        const session = this.getSession();
        if (session && session.token) {
            try {
                await fetch(`${this.API_BASE}/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_token: session.token })
                });
            } catch (error) {}
        }
        this._clearSession();
    },

    getSession() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    },

    isAuthenticated() {
        const session = this.getSession();
        if (!session || !session.token) {
            return false;
        }
        if (session.expires_at && Date.now() > session.expires_at) {
            this._clearSession();
            return false;
        }
        return true;
    },

    _storeSession(token) {
        const session = {
            token: token,
            expires_at: Date.now() + (24 * 60 * 60 * 1000)
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    },

    _clearSession() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};
