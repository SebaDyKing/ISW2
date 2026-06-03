import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export const adminService = {
  getEmpleados: () => api.get('/usuarios/empleados', { headers: getAuthHeader() }),
  getInstalaciones: () => api.get('/instalaciones', { headers: getAuthHeader() }),
  getDashboard: () => api.get('/dashboard', { headers: getAuthHeader() }),
}
