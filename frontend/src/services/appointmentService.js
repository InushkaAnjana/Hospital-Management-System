import api from './api';

export const appointmentService = {
  getAppointments: async (params) => {
    const res = await api.get('/appointments', { params });
    return res;
  },
  getAppointmentById: async (id) => {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },
  bookAppointment: async (data) => {
    const res = await api.post('/appointments', data);
    return res.data;
  },
  rescheduleAppointment: async (id, data) => {
    const res = await api.put(`/appointments/${id}/reschedule`, data);
    return res.data;
  },
  cancelAppointment: async (id, data) => {
    const res = await api.put(`/appointments/${id}/cancel`, data);
    return res.data;
  },
  updateStatus: async (id, status, notes) => {
    const res = await api.put(`/appointments/${id}/status`, { status, notes });
    return res.data;
  },
};
