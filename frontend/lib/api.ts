import axios from 'axios';

// Create a customized instance of axios
const api = axios.create({
  // Use 127.0.0.1 explicitly to match the Django server and avoid CORS mismatches
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true, // Required for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/users/token/refresh/`,
          {},
          { withCredentials: true }
        );

        // Accessing data correctly based on Task 2's JSON wrapper
        const { access } = response.data.data; 
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
