import api from './api';

export const prescriptionService = {
  getPrescriptions: async (params) => {
    const res = await api.get('/prescriptions', { params });
    return res;
  },
  getPrescriptionById: async (id) => {
    const res = await api.get(`/prescriptions/${id}`);
    return res.data;
  },
  createPrescription: async (data) => {
    const res = await api.post('/prescriptions', data);
    return res.data;
  },
  dispensePrescription: async (id) => {
    const res = await api.put(`/prescriptions/${id}/dispense`);
    return res.data;
  },
  cancelPrescription: async (id) => {
    const res = await api.put(`/prescriptions/${id}/cancel`);
    return res.data;
  },
};
