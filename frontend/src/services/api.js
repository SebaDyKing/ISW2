import axios from "axios";

// Creamos una instancia de Axios con la URL base del backend.
// Lee VITE_API_URL del entorno (deploy); en local cae a localhost:3001.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
});

// Interceptor para inyectar automáticamente el token JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
