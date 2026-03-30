import api from './axios';

export const getDoctorsApi = (params) => api.get('/doctors', { params });

export const getDoctorByIdApi = (id) => api.get(`/doctors/${id}`);

export const getDoctorSlotsApi = (doctorId, date) =>
  api.get(`/doctors/${doctorId}/slots`, { params: { date } });
