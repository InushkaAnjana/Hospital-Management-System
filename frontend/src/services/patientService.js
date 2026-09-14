import api from './api';

export const patientService = {
  getPatients: async (params) => {
    const res = await api.get('/patients', { params });
    return res;
  },
  getPatientById: async (id) => {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },
  createPatient: async (data) => {
    const res = await api.post('/patients', data);
    return res.data;
  },
  updatePatient: async (id, data) => {
    const res = await api.put(`/patients/${id}`, data);
    return res.data;
  },
  deletePatient: async (id) => {
    const res = await api.delete(`/patients/${id}`);
    return res.data;
  },
  addDocument: async (id, docData) => {
    const res = await api.post(`/patients/${id}/documents`, docData);
    return res.data;
  },
};
