import api from './axios';

export const createAppointmentApi = (data) => api.post('/appointments', data);

export const getMyAppointmentsApi = () => api.get('/appointments/my');

export const cancelAppointmentApi = (id) =>
  api.patch(`/appointments/${id}/cancel`);

export const getDoctorAppointmentsApi = () =>
  api.get('/appointments/my');

export const updateAppointmentStatusApi = (id, status) =>
  api.patch(`/appointments/${id}/status`, { status });
