import axios from 'axios';

/**
 * api.js
 * Centralized Axios instance for making API calls to the backend.
 * Includes request/response interceptors for authentication and error handling.
 */

// Create a configured axios instance targeting the backend server
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Request Interceptor
 * Automatically attaches the JWT 'Bearer' token from localStorage to every outgoing request.
 * This ensures the user is authenticated on the server side.
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('lecture_auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/**
 * Response Interceptor
 * Intercepts responses before they reach the component.
 * Can be used for global error handling (e.g., clearing state on 401 Unauthorized).
 */
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    // Handling centralized global errors could happen here
    if (error.response && error.response.status === 401) {
        // e.g., trigger logout or redirect
    }
    return Promise.reject(error);
});

// --- API SERVICE GROUPS ---

/**
 * Authentication Endpoints
 */
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
};

/**
 * Static Data Endpoints (Departments, Venues, Levels, Courses)
 * Provides CRUD functionality for basic app entities.
 */
export const dataAPI = {
    getAll: (type) => api.get(`/data/${type}`),
    create: (type, data) => api.post(`/data/${type}`, data),
    update: (type, id, data) => api.put(`/data/${type}/${id}`, data),
    delete: (type, id) => api.delete(`/data/${type}/${id}`),
    
    // Convenience helpers
    getDepartments: () => api.get('/data/departments'),
    getVenues: () => api.get('/data/venues'),
    getLevels: () => api.get('/data/levels'),
    getCourses: () => api.get('/data/courses'),
};

/**
 * Timetable/Schedule Endpoints
 * Used for creating, deleting, and filtering lecture slots.
 */
export const scheduleAPI = {
    getAll: (params) => api.get('/schedules', { params }), // Filters by dept, level, lecturer, etc.
    create: (data) => api.post('/schedules', data),        // Triggers conflict detection on server
    delete: (id) => api.delete(`/schedules/${id}`),        // Cancels a class slot
};

/**
 * User Management Endpoints (Admin Only)
 */
export const userAPI = {
    getAll: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    resetPassword: (id) => api.put(`/users/${id}/reset-password`),
    delete: (id) => api.delete(`/users/${id}`),
};

export default api;

