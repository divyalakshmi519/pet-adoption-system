import axios from 'axios';

const API_BASE_URL = 'https://pet-adoption-system-zcvl.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

export const petAPI = {
  getAll: (params) => api.get('/pets', { params }),
  getById: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post('/pets', data),
  updateStatus: (id, status) => api.put(`/pets/${id}/status`, { status }),
  update: (id, data) => api.put(`/pets/${id}`, data),
};

export const adoptionAPI = {
  apply: (data) => api.post('/adoptions/apply', data),
  getUserApplications: (userId) => api.get(`/adoptions/user/${userId || ''}`),
  updateStatus: (id, status, review_notes) => api.put(`/adoptions/${id}/status`, { status, review_notes }),
  getAll: (params) => api.get('/adoptions/all', { params }),
};

export const dashboardAPI = {
  getAdminAnalytics: () => api.get('/dashboard/admin'),
  getShelterAnalytics: () => api.get('/dashboard/shelter'),
};

export const authAPI = {
  register: (data) => axios.post(`${API_BASE_URL}/auth/register`, data),
  login: (data) => axios.post(`${API_BASE_URL}/auth/login`, data),
  getMe: () => api.get('/auth/me'),
};

export default api;
