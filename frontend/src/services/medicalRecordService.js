import api from './api';

export const medicalRecordService = {
  getMedicalRecords: async (params) => {
    const res = await api.get('/medical-records', { params });
    return res;
  },
  getMedicalRecordById: async (id) => {
    const res = await api.get(`/medical-records/${id}`);
    return res.data;
  },
  createMedicalRecord: async (data) => {
    const res = await api.post('/medical-records', data);
    return res.data;
  },
  updateMedicalRecord: async (id, data) => {
    const res = await api.put(`/medical-records/${id}`, data);
    return res.data;
  },
  addReport: async (id, reportData) => {
    const res = await api.post(`/medical-records/${id}/reports`, reportData);
    return res.data;
  },
};
