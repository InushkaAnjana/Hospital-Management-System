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
    return res.data;
  },
};
