import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // cambiar por URL de tu API en un archivo .env
  withCredentials: true,
})

export const contratosService = {
  getAll: (params) => api.get('/contratos', { params }),
  getById: (id) => api.get(`/contratos/${id}`),
  create: (data) => api.post('/contratos', data),
  update: (id, data) => api.put(`/contratos/${id}`, data),
  delete: (id) => api.delete(`/contratos/${id}`),
}