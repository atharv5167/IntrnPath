// ===========================================
// IntrnPath API Service Layer
// Handles all communication with the backend
// ===========================================

const API = (() => {
    const BASE_URL = '/api';

    // Token management
    let accessToken = localStorage.getItem('internpath_token');
    let refreshToken = localStorage.getItem('internpath_refresh_token');

    // Update tokens
    const setTokens = (access, refresh) => {
        accessToken = access;
        refreshToken = refresh;
        if (access) localStorage.setItem('internpath_token', access);
        if (refresh) localStorage.setItem('internpath_refresh_token', refresh);
    };

    const clearTokens = () => {
        accessToken = null;
        refreshToken = null;
        localStorage.removeItem('internpath_token');
        localStorage.removeItem('internpath_refresh_token');
        localStorage.removeItem('internpath_user');
    };

    const getToken = () => accessToken;
    const isLoggedIn = () => !!accessToken;

    // Base request function
    const request = async (endpoint, options = {}) => {
        const url = `${BASE_URL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            // Handle token refresh
            if (response.status === 401 && refreshToken && !options._isRetry) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    return request(endpoint, { ...options, _isRetry: true });
                }
            }

            if (!response.ok) {
                throw { status: response.status, ...data };
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    // Refresh access token
    const refreshAccessToken = async () => {
        try {
            const response = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (!response.ok) {
                clearTokens();
                return false;
            }

            const data = await response.json();
            setTokens(data.data.access_token, data.data.refresh_token);
            return true;
        } catch {
            clearTokens();
            return false;
        }
    };

    // HTTP method wrappers
    const get = (endpoint) => request(endpoint, { method: 'GET' });
    const post = (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) });
    const put = (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
    const del = (endpoint) => request(endpoint, { method: 'DELETE' });

    // ===========================================
    // AUTH API
    // ===========================================
    const auth = {
        async register(email, password, name, userData = {}) {
            const response = await post('/auth/register', {
                email, password, name, ...userData
            });
            if (response.data?.session) {
                setTokens(response.data.session.access_token, response.data.session.refresh_token);
            }
            return response;
        },

        async login(email, password) {
            const response = await post('/auth/login', { email, password });
            if (response.data?.session) {
                setTokens(response.data.session.access_token, response.data.session.refresh_token);
                // Store user data locally for quick access
                localStorage.setItem('internpath_user', JSON.stringify(response.data.user));
            }
            return response;
        },

        async logout() {
            try {
                await post('/auth/logout', {});
            } finally {
                clearTokens();
                window.location.href = 'index.html';
            }
        },

        async getCurrentUser() {
            return get('/auth/me');
        },

        async forgotPassword(email) {
            return post('/auth/forgot-password', { email });
        },

        async deleteAccount() {
            const response = await del('/auth/delete-account');
            clearTokens();
            return response;
        },

        isLoggedIn,
        getToken,
        clearTokens
    };

    // ===========================================
    // USER PROFILE API
    // ===========================================
    const users = {
        async getProfile() {
            return get('/users/profile');
        },

        async updateProfile(data) {
            return put('/users/profile', data);
        },

        async updateAvatar(avatar) {
            return put('/users/avatar', { avatar });
        },

        async updateBio(bio) {
            return put('/users/bio', { bio });
        },

        async exportData() {
            return get('/users/export');
        }
    };

    // ===========================================
    // SKILLS API
    // ===========================================
    const skills = {
        async getAll() {
            return get('/skills');
        },

        async getRoadmap() {
            return get('/skills/roadmap');
        },

        async getSkill(skillId) {
            return get(`/skills/${skillId}`);
        },

        async updateSkill(skillId, data) {
            return put(`/skills/${skillId}`, data);
        },

        async completeSkill(skillId) {
            return post(`/skills/${skillId}/complete`, {});
        },

        async uncompleteSkill(skillId) {
            return post(`/skills/${skillId}/uncomplete`, {});
        },

        async updateNotes(skillId, notes) {
            return put(`/skills/${skillId}/notes`, { notes });
        },

        async getRecommendations() {
            return get('/skills/recommendations');
        }
    };

    // ===========================================
    // PROGRESS API
    // ===========================================
    const progress = {
        async getAll() {
            return get('/progress');
        },

        async getToday() {
            return get('/progress/today');
        },

        async log(data) {
            return post('/progress/log', data);
        },

        async getStreak() {
            return get('/progress/streak');
        },

        async useStreakFreeze() {
            return post('/progress/streak/freeze', {});
        },

        async getHistory(limit = 30, offset = 0) {
            return get(`/progress/history?limit=${limit}&offset=${offset}`);
        },

        async getWeekly() {
            return get('/progress/weekly');
        },

        async getMonthly() {
            return get('/progress/monthly');
        }
    };

    // ===========================================
    // ANALYTICS API
    // ===========================================
    const analytics = {
        async getDashboard() {
            return get('/analytics/dashboard');
        },

        async getCompletionRate() {
            return get('/analytics/completion-rate');
        },

        async getTimeSpent(period = 30) {
            return get(`/analytics/time-spent?period=${period}`);
        },

        async getTrends() {
            return get('/analytics/trends');
        },

        async getHeatmap(year, month) {
            let url = '/analytics/heatmap';
            if (year && month) url += `?year=${year}&month=${month}`;
            return get(url);
        },

        async getInternshipReadiness() {
            return get('/analytics/internship-readiness');
        }
    };

    // ===========================================
    // PLATFORM LINKS API
    // ===========================================
    const links = {
        async getAll() {
            return get('/links');
        },

        async add(platform, url, isVisible = true) {
            return post('/links', { platform, url, is_visible: isVisible });
        },

        async update(id, data) {
            return put(`/links/${id}`, data);
        },

        async remove(id) {
            return del(`/links/${id}`);
        },

        async toggleVisibility(id, isVisible) {
            return put(`/links/${id}/visibility`, { is_visible: isVisible });
        }
    };

    // ===========================================
    // PROJECTS API
    // ===========================================
    const projects = {
        async getAll() {
            return get('/projects');
        },

        async add(data) {
            return post('/projects', data);
        },

        async update(id, data) {
            return put(`/projects/${id}`, data);
        },

        async remove(id) {
            return del(`/projects/${id}`);
        },

        async toggleFeatured(id, isFeatured) {
            return put(`/projects/${id}/feature`, { is_featured: isFeatured });
        }
    };

    // ===========================================
    // PAYMENTS API
    // ===========================================
    const payments = {
        async getPlans() {
            return get('/payments/plans');
        },

        async createOrder(planId) {
            return post('/payments/create-order', { plan_id: planId });
        },

        async verifyPayment(data) {
            return post('/payments/verify', data);
        },

        async getSubscription() {
            return get('/payments/subscription');
        },

        async cancelSubscription() {
            return post('/payments/cancel', {});
        },

        async getHistory() {
            return get('/payments/history');
        }
    };

    // Export API object
    return {
        auth,
        users,
        skills,
        progress,
        analytics,
        links,
        projects,
        payments,
        // Utilities
        isLoggedIn,
        getToken,
        clearTokens: auth.clearTokens
    };
})();

// Make API globally available
window.API = API;
