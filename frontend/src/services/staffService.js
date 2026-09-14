import api from './api';

export const staffService = {
  getStaff: async (params) => {
    const res = await api.get('/staff', { params });
    return res;
  },
  getStaffById: async (id) => {
    const res = await api.get(`/staff/${id}`);
    return res.data;
  },
  createStaff: async (data) => {
    const res = await api.post('/staff', data);
    return res.data;
  },
  updateStaff: async (id, data) => {
    const res = await api.put(`/staff/${id}`, data);
    return res.data;
  },
  markAttendance: async (id, data) => {
    const res = await api.post(`/staff/${id}/attendance`, data);
    return res.data;
  },
  applyLeave: async (id, data) => {
    const res = await api.post(`/staff/${id}/leave`, data);
    return res.data;
  },
  updateLeaveStatus: async (staffId, leaveId, data) => {
    const res = await api.patch(`/staff/${staffId}/leave/${leaveId}/status`, data);
    return res.data;
  },
  deleteStaff: async (id) => {
    const res = await api.delete(`/staff/${id}`);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/staff/stats');
    return res.data;
  },
};
