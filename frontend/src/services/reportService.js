import api from './api';

export const reportService = {
  getPatientReport: async (params) => {
    const res = await api.get('/reports/patients', { params });
    return res.data;
  },
  getAppointmentReport: async (params) => {
    const res = await api.get('/reports/appointments', { params });
    return res.data;
  },
  getRevenueReport: async (params) => {
    const res = await api.get('/reports/revenue', { params });
    return res.data;
  },
  getPharmacyReport: async (params) => {
    const res = await api.get('/reports/pharmacy', { params });
    return res.data;
  },
  getLabReport: async (params) => {
    const res = await api.get('/reports/laboratory', { params });
    return res.data;
  },
  getStaffReport: async (params) => {
    const res = await api.get('/reports/staff', { params });
    return res.data;
  },
};
