import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

let refreshingToken = false;
let pendingRequests = [];

const processPendingRequests = (error) => {
  pendingRequests.forEach((cb) => cb(error));
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (refreshingToken) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((err) => {
            if (err) return reject(err);
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      refreshingToken = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        processPendingRequests(null);
        return api(originalRequest);
      } catch (refreshError) {
        processPendingRequests(refreshError);
        localStorage.removeItem("usuario");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        refreshingToken = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;