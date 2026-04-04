import api from './axios';

export const createPaymentApi = (data) => api.post('/payments', data);

export const getMyPaymentsApi = (params) => api.get('/payments/my', { params });

export const getPaymentByAppointmentApi = (appointmentId) =>
  api.get(`/payments/appointment/${appointmentId}`);
