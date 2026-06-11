import axios from 'axios';

// ─── Axios instance ────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// ─── Request interceptor ───────────────────────────────
// প্রতিটা request-এ localStorage থেকে token attach করে
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ──────────────────────────────
// 401 পেলে token মুছে login-এ পাঠায়
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth calls ────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

// ─── নতুন resource যোগ করো এখানে ─────────────────────
// export const userAPI = {
//   getAll:  ()       => api.get('/users'),
//   getOne:  (id)     => api.get(`/users/${id}`),
//   update:  (id, d)  => api.put(`/users/${id}`, d),
//   delete:  (id)     => api.delete(`/users/${id}`),
// };

export default api;
