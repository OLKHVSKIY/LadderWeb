// API модуль для работы с backend
// Используем window.API_URL если задан, иначе текущий origin
const API_BASE_URL = (typeof window !== 'undefined' && window.API_URL)
    || (typeof window !== 'undefined' && window.location ? `${window.location.origin}/api` : 'http://localhost:8000/api');

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('auth_token') || null;
        this.userId = localStorage.getItem('user_id') || null;
    }

    async request(endpoint, options = {}) {
        if (!this.token && !this.userId) {
            await this.ensureUser();
        }

        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
                ...(this.userId ? { 'X-User-Id': this.userId } : this.buildIdentityHeaders()),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            
            // Если API недоступен, возвращаем пустой результат без ошибки
            if (!response.ok && response.status === 0) {
                console.warn('API недоступен, используется localStorage');
                return null;
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Request failed');
            }
            
            return data;
        } catch (error) {
            // Если это ошибка сети (API недоступен), не выбрасываем ошибку
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.warn('API недоступен, используется localStorage');
                return null;
            }
            console.error('API Error:', error);
            throw error;
        }
    }

    buildIdentityHeaders() {
        const headers = {};
        const userName = localStorage.getItem('user_name');
        const userEmail = localStorage.getItem('user_email');
        const telegramUser = localStorage.getItem('telegram_user');

        if (userName) {
            headers['X-User-Name'] = userName;
        }
        if (userEmail) {
            headers['X-User-Email'] = userEmail;
        }
        if (telegramUser) {
            try {
                const tg = JSON.parse(telegramUser);
                if (tg?.id) {
                    headers['X-Telegram-Id'] = String(tg.id);
                }
            } catch (error) {
                console.warn('Failed to parse telegram_user:', error);
            }
        }

        return headers;
    }

    async ensureUser() {
        try {
            const response = await fetch(`${this.baseURL}/users/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.buildIdentityHeaders(),
                },
            });
            if (!response.ok) {
                return;
            }
            const data = await response.json();
            if (data?.id) {
                this.userId = String(data.id);
                localStorage.setItem('user_id', this.userId);
            }
        } catch (error) {
            console.warn('User resolution failed:', error);
        }
    }

    // Auth endpoints (отключены - авторизация не требуется)
    async login(username, password) {
        return { success: true };
    }

    async logout() {
        // Авторизация отключена
        this.token = null;
    }

    // Task endpoints
    async getTasks() {
        return this.request('/tasks');
    }

    async getTask(id) {
        return this.request(`/tasks/${id}`);
    }

    async createTask(task) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        });
    }

    async updateTask(id, task) {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(task),
        });
    }

    async deleteTask(id) {
        return this.request(`/tasks/${id}`, {
            method: 'DELETE',
        });
    }

    // AI endpoints
    async decomposeTask(description) {
        return this.request('/ai/decompose', {
            method: 'POST',
            body: JSON.stringify({ description }),
        });
    }

    // User endpoints
    async getProfile() {
        return this.request('/users/me');
    }

    async updateProfile(payload) {
        return this.request('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    // Notes endpoints
    async getNotes(workspaceId) {
        const encoded = encodeURIComponent(workspaceId || 'personal');
        return this.request(`/notes?workspace_id=${encoded}`);
    }

    async saveNotes(workspaceId, stickers) {
        return this.request('/notes', {
            method: 'PUT',
            body: JSON.stringify({
                workspace_id: workspaceId || 'personal',
                stickers: stickers || [],
            }),
        });
    }
}

export const api = new ApiClient();
