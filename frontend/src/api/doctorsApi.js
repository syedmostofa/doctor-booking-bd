import api from './axios';

export const getDoctorsApi = (params) => api.get('/doctors', { params });

export const getDoctorByIdApi = (id) => api.get(`/doctors/${id}`);

export const getDoctorSlotsApi = (doctorId, date) =>
  api.get(`/slots/doctor/${doctorId}`, { params: { date } });

export const createDoctorProfileApi = (data) => api.post('/doctors', data);

export const updateDoctorProfileApi = (id, data) => api.patch(`/doctors/${id}`, data);

export const createSlotApi = (data) => api.post('/slots', data);

export const deleteSlotApi = (id) => api.delete(`/slots/${id}`);
