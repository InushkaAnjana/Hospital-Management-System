import api from './api';

export const labService = {
  getLabTests: async (params) => {
    const res = await api.get('/lab', { params });
    return res;
  },
  getLabTestById: async (id) => {
    const res = await api.get(`/lab/${id}`);
    return res.data;
  },
  createLabTest: async (data) => {
    const res = await api.post('/lab', data);
    return res.data;
  },
  collectSample: async (id) => {
    const res = await api.patch(`/lab/${id}/collect`);
    return res.data;
  },
  enterResult: async (id, data) => {
    const res = await api.post(`/lab/${id}/result`, data);
    return res.data;
  },
  updateLabTest: async (id, data) => {
    const res = await api.put(`/lab/${id}`, data);
    return res.data;
  },
  deleteLabTest: async (id) => {
    const res = await api.delete(`/lab/${id}`);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/lab/stats');
    return res.data;
  },
};
