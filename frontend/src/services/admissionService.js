import api from './api';

export const admissionService = {
  getAdmissions: async (params) => {
    const res = await api.get('/admissions', { params });
    return res;
  },
  getAdmissionById: async (id) => {
    const res = await api.get(`/admissions/${id}`);
    return res.data;
  },
  createAdmission: async (data) => {
    const res = await api.post('/admissions', data);
    return res.data;
  },
  dischargePatient: async (id, data) => {
    const res = await api.post(`/admissions/${id}/discharge`, data);
    return res.data;
  },
  addVitals: async (id, data) => {
    const res = await api.post(`/admissions/${id}/vitals`, data);
    return res.data;
  },
  updateAdmission: async (id, data) => {
    const res = await api.put(`/admissions/${id}`, data);
    return res.data;
  },
  deleteAdmission: async (id) => {
    const res = await api.delete(`/admissions/${id}`);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/admissions/stats');
    return res.data;
  },
};
