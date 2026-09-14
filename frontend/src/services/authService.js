import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Discard token regardless
    }
  },
  getUsers: async (params) => {
    const res = await api.get('/auth/users', { params });
    return res;
  },
  registerUser: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  updateUser: async (id, userData) => {
    const res = await api.put(`/auth/users/${id}`, userData);
    return res.data;
  },
  toggleUserStatus: async (id) => {
    const res = await api.put(`/auth/users/${id}/toggle-status`);
    return res.data;
  },
  resetPassword: async (id, newPassword) => {
    const res = await api.put(`/auth/users/${id}/reset-password`, { newPassword });
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/auth/users/${id}`);
    return res.data;
  },
};
