import api from '../../../config/axios';

export const contratosService = {
  getAll: (params) => api.get('/contratos', { params }),
  getById: (id) => api.get(`/contratos/${id}`),
  create: (data) => api.post('/contratos', data),
  update: (id, data) => api.put(`/contratos/${id}`, data),
  delete: (id) => api.delete(`/contratos/${id}`),
}