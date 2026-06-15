import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
// Attempt silent refresh on 401, then retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // List of public endpoints that don't require authentication
    const publicEndpoints = [
      '/auth/register',
      '/auth/login',
      '/workers',
      '/categories',
      '/reviews',
    ];

    // Check if the request is to a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest.url.includes(endpoint)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', response.data.accessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${response.data.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Keep the in-memory auth state in sync so the app stops treating
        // stale sessions as authenticated after a refresh failure.
        try {
          const { useAuthStore } = await import('../utils/store');
          useAuthStore.getState().logout();
        } catch (storeError) {
          // If the store import fails for any reason, we still continue with
          // the storage cleanup above.
        }

        // Avoid reloading /login when we're already there; that can create a
        // self-refresh loop if another request fails on the login page.
        if (!isPublicEndpoint && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
