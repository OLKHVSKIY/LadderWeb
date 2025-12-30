// API модуль для работы с backend
// Используем window.API_URL если задан, иначе значение по умолчанию
const API_BASE_URL = (typeof window !== 'undefined' && window.API_URL) || 'http://localhost:8000/api';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        // Авторизация отключена - токен не требуется
        this.token = null;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                // Авторизация отключена - заголовок Authorization не добавляется
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

    // Auth endpoints (отключены - авторизация не требуется)
    async login(username, password) {
        // Авторизация отключена
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
}

export const api = new ApiClient();

