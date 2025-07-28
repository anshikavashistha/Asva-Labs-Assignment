import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string; tenant_id: number }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getProfile: () => api.get('/auth/profile'),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  
  getById: (id: number) => api.get(`/projects/${id}`),
  
  create: (data: { name: string; description?: string; status?: string; tenant_id: number }) =>
    api.post('/projects', data),
  
  update: (id: number, data: { name?: string; description?: string; status?: string }) =>
    api.put(`/projects/${id}`, data),
  
  delete: (id: number) => api.delete(`/projects/${id}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (projectId: number) => api.get(`/projects/${projectId}/tasks`),
  
  getById: (projectId: number, taskId: number) => 
    api.get(`/projects/${projectId}/tasks/${taskId}`),
  
  create: (projectId: number, data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    assigned_to?: number;
  }) => api.post(`/projects/${projectId}/tasks`, data),
  
  update: (projectId: number, taskId: number, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    assigned_to?: number;
  }) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  
  delete: (projectId: number, taskId: number) => 
    api.delete(`/projects/${projectId}/tasks/${taskId}`),
};

export default api; 