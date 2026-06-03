import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export const contratosService = {
  getAll: (params) => api.get('/contratos', { params, headers: getAuthHeader() }),
  getById: (id) => api.get(`/contratos/${id}`, { headers: getAuthHeader() }),
  create: (data) => api.post('/contratos', data, { headers: getAuthHeader() }),
  update: (id, data) => api.put(`/contratos/${id}`, data, { headers: getAuthHeader() }),
  delete: (id) => api.delete(`/contratos/${id}`, { headers: getAuthHeader() }),
}