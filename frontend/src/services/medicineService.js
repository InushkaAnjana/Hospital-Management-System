import api from './api';

export const medicineService = {
  getMedicines: async (params) => {
    const res = await api.get('/medicines', { params });
    return res.data;
  },
  getMedicineById: async (id) => {
    const res = await api.get(`/medicines/${id}`);
    return res.data;
  },
  createMedicine: async (data) => {
    const res = await api.post('/medicines', data);
    return res.data;
  },
  updateMedicine: async (id, data) => {
    const res = await api.put(`/medicines/${id}`, data);
    return res.data;
  },
  deleteMedicine: async (id) => {
    const res = await api.delete(`/medicines/${id}`);
    return res.data;
  },
};
