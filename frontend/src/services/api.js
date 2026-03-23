/**
 * @file api.js
 * @description Centralized Networking Layer for the Frontend.
 * Extends Axios to provide institutionalized API communication with 
 * automatic token management and unified error handling.
 */

import axios from 'axios';

/**
 * @constant API_BASE_URL
 * @description Root path for all backend resource requests.
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * @instance api
 * @description Configured Axios instance. Standardizes headers and base configurations.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // Reasonable timeout of 15s for network requests
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * @interceptor REQUEST_AUTH
 * @description Injects the authorization header before every outgoing request.
 * Retrieves the current session token from local browser storage.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('lecture_auth_token');
        if (token) {
            /** 
             * Standard 'Bearer' scheme for JWT.
             * This token is required for all 'protected' server-side routes.
             */
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * @interceptor RESPONSE_HANDLING
 * @description Global hook for handling server responses.
 * Can be used for centralized error logging or redirecting on session expiry (401).
 */
api.interceptors.response.use(
    (response) => response, 
    (error) => {
        // Log network-level errors for developers
        console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data?.message || error.message);
        
        // 401 Unauthorized Handling: Ideally triggers a logout if session is definitely expired
        if (error.response && error.response.status === 401) {
            // Logic to clear local state can be injected via callbacks or events if needed
        }
        
        return Promise.reject(error);
    }
);

/**
 * @namespace authAPI
 * @description Handlers for security-related communications (Login, MFA, Recovery).
 */
export const authAPI = {
    /** 
     * @function login
     * @param {Object} credentials - { email, password }
     */
    login: (credentials) => api.post('/auth/login', credentials),
};

/**
 * @namespace dataAPI
 * @description Domain handlers for entity management (Resources, Courses, Locations).
 */
export const dataAPI = {
    /** Generic CRUD operations for system entities */
    getAll: (type) => api.get(`/data/${type}`),
    create: (type, data) => api.post(`/data/${type}`, data),
    update: (type, id, data) => api.put(`/data/${type}/${id}`, data),
    delete: (type, id) => api.delete(`/data/${type}/${id}`),
    
    /** Specific entity fetchers (Convenience Shortcuts) */
    getDepartments: () => api.get('/data/departments'),
    getVenues: () => api.get('/data/venues'),
    getLevels: () => api.get('/data/levels'),
    getCourses: () => api.get('/data/courses'),
};

/**
 * @namespace scheduleAPI
 * @description Networking handlers for the core scheduling engine.
 */
export const scheduleAPI = {
    /** Fetch schedules with complex filtering logic */
    getAll: (params) => api.get('/schedules', { params }), 
    
    /** Create a new schedule (Subject to server-side conflict detection) */
    create: (data) => api.post('/schedules', data),        
    
    /** Request removal of an existing class slot */
    delete: (id) => api.delete(`/schedules/${id}`),        
};

/**
 * @namespace userAPI
 * @description Administrative user management (Staff accounts, Permissions).
 */
export const userAPI = {
    /** Admin-only User List */
    getAll: () => api.get('/users'),
    
    /** Admin-only manual account creation */
    create: (data) => api.post('/users', data),
    
    /** Authorization role adjustment */
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    
    /** Manual administrative override for user password locks */
    resetPassword: (id) => api.put(`/users/${id}/reset-password`),
    
    /** Permanent account removal */
    delete: (id) => api.delete(`/users/${id}`),
};

export default api;


