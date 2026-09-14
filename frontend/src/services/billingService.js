import api from './api';

export const billingService = {
  getInvoices: async (params) => {
    const res = await api.get('/billing', { params });
    return res;
  },
  getInvoiceById: async (id) => {
    const res = await api.get(`/billing/${id}`);
    return res.data;
  },
  createInvoice: async (data) => {
    const res = await api.post('/billing', data);
    return res.data;
  },
  updateInvoice: async (id, data) => {
    const res = await api.put(`/billing/${id}`, data);
    return res.data;
  },
  recordPayment: async (id, paymentData) => {
    const res = await api.post(`/billing/${id}/payment`, paymentData);
    return res.data;
  },
  deleteInvoice: async (id) => {
    const res = await api.delete(`/billing/${id}`);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/billing/stats');
    return res.data;
  },
};
