import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', // Ajuste default para local
  withCredentials: true,
})

export const adminService = {
  getEmpleados: () => api.get('/usuarios/empleados'), // Asumiendo ruta
  getInstalaciones: () => api.get('/instalaciones'),  // Asumiendo ruta
  getDashboard: () => api.get('/dashboard'),
}
